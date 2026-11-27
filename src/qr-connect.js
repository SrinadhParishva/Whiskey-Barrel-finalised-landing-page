import QRCode from 'qrcode';
import wbIconDataUrl from '../assets/wb-icon.png';

/**
 * Central configuration for Whiskey Barrel Digital Connect & QR Code.
 * Update `googleReviewUrl` once your exact Google Business Profile Review link is ready.
 */
export const WHISKEY_BARREL_CONNECT_CONFIG = {
  connectPageUrl: 'https://whiskeybarrel.store/connect/',
  instagramUrl: 'https://www.instagram.com/whiskeybarrelusa?stkn=MTczeDAzcjF1Z2FpdA==',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61596083529437',
  tiktokUrl: 'https://www.tiktok.com/@whiskey.barrel0',
  websiteUrl: 'https://whiskeybarrel.store',
  googleMapsUrl:
    'https://www.google.com/maps/place/Whiskey+Barrel/@39.0143816,-94.7279887,15z/data=!4m15!1m8!3m7!1s0x87c0ed9157f883f7:0xc38d104d634d33ed!2sWhiskey+Barrel!8m2!3d39.0141541!4d-94.727787!10e5!16s%2Fg%2F11spn4_7qy!3m5!1s0x87c0ed9157f883f7:0xc38d104d634d33ed!8m2!3d39.0141541!4d-94.727787!16s%2Fg%2F11spn4_7qy',
  // Placeholder: Replace empty string with official Google Review URL (e.g. https://g.page/r/<ID>/review)
  googleReviewUrl: '',
  whatsappUrl: 'https://wa.me/19134002339',
};

let cachedLogoPromise = null;

/**
 * Loads the embedded Whiskey Barrel logo Data URL into an HTMLImageElement
 * without requiring network fetch() calls (works over HTTP, HTTPS, and file://).
 */
function loadBrandLogo() {
  if (cachedLogoPromise) return cachedLogoPromise;
  cachedLogoPromise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ image: img, dataUrl: wbIconDataUrl });
    img.onerror = () => resolve({ image: null, dataUrl: wbIconDataUrl });
    img.src = wbIconDataUrl;
  });
  return cachedLogoPromise;
}

/**
 * Builds QR module matrix using Error Correction Level H (~30% redundancy)
 * to preserve full scanning reliability with the central Whiskey Barrel emblem.
 */
export function buildQrMatrix(targetUrl = WHISKEY_BARREL_CONNECT_CONFIG.connectPageUrl) {
  const qr = QRCode.create(targetUrl, {
    errorCorrectionLevel: 'H',
  });
  return {
    size: qr.modules.size,
    data: qr.modules.data,
  };
}

/**
 * Draws the QR modules cleanly first (synchronously) and then overlays the
 * centered padded circular Whiskey Barrel emblem once decoded.
 */
export async function renderBrandedQrToCanvas(canvas, options = {}) {
  if (!canvas) return null;
  const {
    url = WHISKEY_BARREL_CONNECT_CONFIG.connectPageUrl,
    pixelSize = 600,
    quietModules = 4,
    includeGoldBorder = false,
    logoData = null,
  } = options;

  const matrix = buildQrMatrix(url);
  const totalModules = matrix.size + quietModules * 2;
  const modulePx = Math.max(2, Math.floor(pixelSize / totalModules));
  const qrDrawSize = modulePx * totalModules;
  const borderPad = includeGoldBorder ? Math.round(qrDrawSize * 0.03) : 0;
  const finalSize = qrDrawSize + borderPad * 2;

  canvas.width = finalSize;
  canvas.height = finalSize;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, finalSize, finalSize);

  // Subtle gold outer frame inside export when requested
  if (includeGoldBorder && borderPad > 0) {
    const strokeW = Math.max(2, Math.round(finalSize * 0.0045));
    const inset = Math.round(borderPad * 0.45);
    ctx.strokeStyle = '#D4A24D';
    ctx.lineWidth = strokeW;
    ctx.strokeRect(inset, inset, finalSize - inset * 2, finalSize - inset * 2);
  }

  // Central logo geometry: keep total padded badge ~19% of QR matrix width
  const qrAreaPx = matrix.size * modulePx;
  const badgeDiameter = Math.round(qrAreaPx * 0.19);
  const badgeRadius = badgeDiameter / 2;
  const centerX = finalSize / 2;
  const centerY = finalSize / 2;

  // Draw crisp black QR modules immediately
  ctx.fillStyle = '#000000';
  const offset = borderPad + quietModules * modulePx;

  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (!matrix.data[row * matrix.size + col]) continue;

      const x = offset + col * modulePx;
      const y = offset + row * modulePx;
      const mx = x + modulePx / 2;
      const my = y + modulePx / 2;
      const dist = Math.hypot(mx - centerX, my - centerY);

      if (dist < badgeRadius + modulePx * 0.45) {
        continue;
      }
      ctx.fillRect(x, y, modulePx, modulePx);
    }
  }

  // Clean white circular cushion behind central logo
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, modulePx * 0.3);
  ctx.strokeStyle = 'rgba(212, 162, 77, 0.78)';
  ctx.stroke();
  ctx.restore();

  // Draw original Whiskey Barrel logo inside circular cushion
  const loaded = logoData || (await loadBrandLogo());
  if (loaded?.image) {
    const logoSize = Math.round(badgeDiameter * 0.8);
    const logoX = centerX - logoSize / 2;
    const logoY = centerY - logoSize / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(loaded.image, logoX, logoY, logoSize, logoSize);
    ctx.restore();
  }

  return { matrix, loaded, finalSize };
}

function triggerBlobDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

async function initWhiskeyBarrelConnect() {
  const logoData = await loadBrandLogo();

  // 1. Render Connect Page QR preview if present
  const connectCanvas = document.getElementById('connect-qr-canvas');
  if (connectCanvas) {
    await renderBrandedQrToCanvas(connectCanvas, {
      url: WHISKEY_BARREL_CONNECT_CONFIG.connectPageUrl,
      pixelSize: 560,
      quietModules: 4,
      includeGoldBorder: false,
      logoData,
    });
  }

  // 2. Render Homepage "beside Get Directions" QR widget if present
  const homeCanvas = document.getElementById('home-connect-qr-canvas');
  if (homeCanvas) {
    await renderBrandedQrToCanvas(homeCanvas, {
      url: WHISKEY_BARREL_CONNECT_CONFIG.connectPageUrl,
      pixelSize: 320,
      quietModules: 4,
      includeGoldBorder: false,
      logoData,
    });
  }

  // 3. Configure Google Review button cleanly from central config
  const reviewBtn = document.getElementById('connect-google-review-btn');
  const reviewNote = document.getElementById('connect-google-review-note');
  if (reviewBtn) {
    const configuredReviewUrl = (WHISKEY_BARREL_CONNECT_CONFIG.googleReviewUrl || '').trim();
    if (configuredReviewUrl) {
      reviewBtn.href = configuredReviewUrl;
      reviewBtn.target = '_blank';
      reviewBtn.rel = 'noopener noreferrer';
      reviewBtn.removeAttribute('aria-disabled');
      reviewBtn.classList.remove('is-unconfigured');
      if (reviewNote) reviewNote.hidden = true;
    } else {
      reviewBtn.removeAttribute('href');
      reviewBtn.setAttribute('aria-disabled', 'true');
      reviewBtn.classList.add('is-unconfigured');
      if (reviewNote) reviewNote.hidden = false;
    }
  }

  // 4. High-res PNG Download button (1200+ px with center logo + gold frame)
  const downloadPngBtn = document.getElementById('download-qr-png-btn');
  if (downloadPngBtn) {
    downloadPngBtn.addEventListener('click', async () => {
      const exportCanvas = document.createElement('canvas');
      await renderBrandedQrToCanvas(exportCanvas, {
        url: WHISKEY_BARREL_CONNECT_CONFIG.connectPageUrl,
        pixelSize: 1200,
        quietModules: 4,
        includeGoldBorder: true,
        logoData,
      });
      exportCanvas.toBlob(
        (blob) => {
          if (blob) triggerBlobDownload(blob, 'whiskey-barrel-connect-qr.png');
        },
        'image/png',
        1.0
      );
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWhiskeyBarrelConnect);
} else {
  initWhiskeyBarrelConnect();
}
