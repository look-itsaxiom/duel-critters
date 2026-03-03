import QRCode from 'qrcode'

export async function generateQRDataUrl(url: string): Promise<string> {
  return await QRCode.toDataURL(url, {
    width: 120,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  })
}
