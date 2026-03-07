import { jsPDF } from "jspdf";

export interface DossierForPdf {
  numeroDossier: string;
  dateEntree: string;
  juridictionNom?: string | null;
  parquetNom?: string | null;
  juridictionBasParquet?: string | null;
  prevention: string;
  observation?: string | null;
  detenu: {
    nom: string;
    prenom: string;
    poste?: string | null;
    lieuNaissance?: string | null;
    dateNaissance?: string | null;
    nationalite?: string | null;
    adresse?: string | null;
    categorie?: string;
  } | null;
  photoUrl?: string | null;
  /** Titres des pièces jointes (documents parquet / cour) à mentionner dans le PDF */
  pieceJointes?: { titre: string }[];
}

export interface GeneratePdfOptions {
  /** Origine du site (ex. window.location.origin) pour charger les logos et générer l’URL du QR */
  baseUrl?: string;
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Retourne les dimensions en pixels d’une image à partir de son data URL (évite l’étirement). */
function getImageDimensions(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUrl;
  });
}

/** Calcule largeur et hauteur pour tenir dans maxW x maxH en gardant le ratio. */
function fitInBox(imgW: number, imgH: number, maxW: number, maxH: number): { w: number; h: number } {
  if (imgW <= 0 || imgH <= 0) return { w: maxW, h: maxH };
  const scale = Math.min(maxW / imgW, maxH / imgH, 1);
  return { w: imgW * scale, h: imgH * scale };
}

async function getQrDataUrl(scanUrl: string, sizePx: number = 120): Promise<string | null> {
  try {
    const QRCode = (await import("qrcode")).default;
    return await QRCode.toDataURL(scanUrl, { width: sizePx, margin: 1 });
  } catch {
    return null;
  }
}

/** Génère et télécharge le PDF du dossier — A4 paysage, fond blanc, logos RDC (gauche) et Justice (droite), photo et QR. */
export async function generateDossierPdf(data: DossierForPdf, options: GeneratePdfOptions = {}): Promise<void> {
  const baseUrl = options.baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = 297;
  const pageH = 210;
  const margin = 14;
  const headerH = 22;
  const colLeftW = 165;
  const colRightX = margin + colLeftW + 8;
  const colRightW = pageW - colRightX - margin;

  doc.setTextColor(0, 0, 0);

  // ——— En-tête : fond blanc, logo RDC à gauche, texte au centre, logo Justice à droite (ratio préservé) ———
  const logoRdcW = 20;
  const logoRdcH = 16;
  const logoJusticeMaxW = 22;
  const logoJusticeMaxH = 22;

  const [logoRdc, logoJustice] = await Promise.all([
    baseUrl ? loadImageAsDataUrl(`${baseUrl}/images/rdc.png`) : null,
    baseUrl ? loadImageAsDataUrl(`${baseUrl}/images/logo_justice.png`) : null,
  ]);

  if (logoRdc) {
    try {
      doc.addImage(logoRdc, "PNG", margin, 4, logoRdcW, logoRdcH);
    } catch {
      // ignore
    }
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PRISON CENTRALE DE MAKALA", pageW / 2, 10, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("République Démocratique du Congo", pageW / 2, 15, { align: "center" });
  doc.text("Fiche dossier — FilePe", pageW / 2, 19, { align: "center" });
  doc.setTextColor(0, 0, 0);

  if (logoJustice) {
    try {
      const dims = await getImageDimensions(logoJustice);
      const { w: logoJusticeW, h: logoJusticeH } = fitInBox(dims.w, dims.h, logoJusticeMaxW, logoJusticeMaxH);
      const logoJusticeX = pageW - margin - logoJusticeW;
      const logoJusticeY = (headerH - logoJusticeH) / 2;
      doc.addImage(logoJustice, "PNG", logoJusticeX, logoJusticeY, logoJusticeW, logoJusticeH);
    } catch {
      // ignore
    }
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, headerH + 2, pageW - margin, headerH + 2);

  let y = headerH + 10;

  const sectionTitle = (title: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(title, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
  };

  const lineLabel = (label: string, value: string, x: number = margin) => {
    if (!value) return;
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(label, x, y);
    doc.setTextColor(0, 0, 0);
    doc.text(value, x + 32, y);
    y += 5;
  };

  // ——— Colonne gauche : titre du dossier + identité + dossier + prévention + observation ———
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`FICHE DOSSIER N° ${data.numeroDossier}`, margin, y);
  y += 8;

  if (data.detenu) {
    sectionTitle("I — IDENTITÉ DU PRÉVENU / DÉTENU");
    lineLabel("Nom / Prénom :", `${data.detenu.nom} ${data.detenu.prenom}`);
    lineLabel("Poste :", data.detenu.poste ?? "—");
    lineLabel("Naissance :", [data.detenu.lieuNaissance, data.detenu.dateNaissance].filter(Boolean).join(" · ") || "—");
    lineLabel("Nationalité :", data.detenu.nationalite ?? "—");
    if (data.detenu.adresse) lineLabel("Adresse :", data.detenu.adresse);
    y += 3;
  }

  sectionTitle("II — DOSSIER");
  lineLabel("Date d'entrée :", data.dateEntree);
  lineLabel("Juridiction :", data.juridictionNom ? `${data.juridictionNom} près` : "—");
  lineLabel("Parquet :", data.parquetNom ? `${data.parquetNom} près` : "—");
  lineLabel("J. bas parquet :", data.juridictionBasParquet ?? "—");
  y += 3;

  sectionTitle("III — PRÉVENTION (MOTIF DE DÉTENTION)");
  doc.setFontSize(8);
  const splitPrev = doc.splitTextToSize(data.prevention || "—", colLeftW - 4);
  doc.text(splitPrev, margin, y);
  y += splitPrev.length * 4 + 4;

  sectionTitle("IV — OBSERVATION (ÉTAT DE LA PROCÉDURE)");
  const splitObs = doc.splitTextToSize(data.observation || "—", colLeftW - 4);
  doc.text(splitObs, margin, y);
  y += splitObs.length * 4 + 4;

  if (data.pieceJointes && data.pieceJointes.length > 0) {
    sectionTitle("V — PIÈCES JOINTES (DOCUMENTS PARQUET / COUR)");
    data.pieceJointes.forEach((p, i) => {
      doc.setFontSize(8);
      doc.text(`${i + 1}. ${p.titre}`, margin, y);
      y += 5;
    });
    y += 2;
  }

  // ——— Colonne droite : photo puis QR code dans un cadre dédié ———
  const rightColW = colRightW;
  let rightY = headerH + 10;

  if (data.photoUrl && data.photoUrl.startsWith("data:image")) {
    try {
      const photoW = 42;
      const photoH = 50;
      doc.addImage(data.photoUrl, "JPEG", colRightX, rightY, photoW, photoH);
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("Photo d'identité", colRightX, rightY + photoH + 4);
      doc.setTextColor(0, 0, 0);
      rightY += photoH + 10;
    } catch {
      rightY += 2;
    }
  }

  const scanUrl = baseUrl ? `${baseUrl}/scan/${encodeURIComponent(data.numeroDossier)}` : "";
  const qrDataUrl = scanUrl ? await getQrDataUrl(scanUrl, 140) : null;
  if (qrDataUrl) {
    try {
      const qrSize = 32;
      const qrBoxX = colRightX;
      const qrBoxY = rightY;
      const qrBoxW = qrSize + 4;
      const qrBoxH = qrSize + 14;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.rect(qrBoxX, qrBoxY, qrBoxW, qrBoxH);
      doc.addImage(qrDataUrl, "PNG", qrBoxX + 2, qrBoxY + 2, qrSize, qrSize);
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text("Scan dossier", qrBoxX + qrBoxW / 2, qrBoxY + qrSize + 10, { align: "center" });
      doc.text(data.numeroDossier, qrBoxX + qrBoxW / 2, qrBoxY + qrSize + 13, { align: "center" });
      doc.setTextColor(0, 0, 0);
    } catch {
      // ignore
    }
  }

  // ——— Pied de page ———
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Document généré par FilePe — ${new Date().toLocaleString("fr-FR")}`, margin, pageH - 6);
  doc.setTextColor(0, 0, 0);

  doc.save(`dossier-${data.numeroDossier}.pdf`);
}
