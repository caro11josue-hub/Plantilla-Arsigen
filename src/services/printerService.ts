import { RestaurantOrder, OrderItemSnapshot, RestaurantConfig } from '../domain/models';

const LINE_WIDTH = 32; // Exactamente 32 columnas para papel de 58 mm (POS-5890U-L)

/**
 * Centra un texto en 32 columnas.
 */
function centerText(text: string): string {
  if (text.length >= LINE_WIDTH) return text.slice(0, LINE_WIDTH);
  const leftPadding = Math.floor((LINE_WIDTH - text.length) / 2);
  const rightPadding = LINE_WIDTH - text.length - leftPadding;
  return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
}

/**
 * Formatea una fila de 2 columnas (izquierda y derecha alineadas).
 */
function formatTwoColumns(left: string, right: string): string {
  const maxLeft = LINE_WIDTH - right.length - 1;
  const truncatedLeft = left.length > maxLeft ? left.slice(0, maxLeft) : left;
  const spaces = LINE_WIDTH - truncatedLeft.length - right.length;
  return truncatedLeft + ' '.repeat(Math.max(1, spaces)) + right;
}

/**
 * Formateador de moneda simple para tickets térmicos (ej: $34.000)
 */
function formatReceiptCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`;
}

/**
 * Comandos ESC/POS estándar
 */
export const ESC_POS = {
  INIT: '\x1b\x40',             // ESC @: Inicializar impresora
  ALIGN_LEFT: '\x1b\x61\x00',   // ESC a 0: Alinear izquierda
  ALIGN_CENTER: '\x1b\x61\x01', // ESC a 1: Alinear centro
  ALIGN_RIGHT: '\x1b\x61\x02',  // ESC a 2: Alinear derecha
  BOLD_ON: '\x1b\x45\x01',      // ESC E 1: Negrita ON
  BOLD_OFF: '\x1b\x45\x00',     // ESC E 0: Negrita OFF
  DOUBLE_HEIGHT_ON: '\x1d\x21\x01', // Altura doble
  DOUBLE_OFF: '\x1d\x21\x00',
  FEED_3_LINES: '\x1b\x64\x03', // Alimentar 3 líneas
  CUT_FULL: '\x1d\x56\x00',     // GS V 0: Corte de papel
};

export interface FormattedTicket {
  rawText: string;
  escPosBytes: Uint8Array;
}

/**
 * Convierte un string ASCII a Uint8Array
 */
function stringToEscPosBytes(text: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

/**
 * FORMATO 1: Comanda Inicial de Cocina/Barra (Cero Precios)
 */
export function generateInitialComanda(order: RestaurantOrder): FormattedTicket {
  const divider = '-'.repeat(LINE_WIDTH);
  const lines: string[] = [];

  lines.push(centerText('================================'));
  lines.push(centerText('*** COMANDA COCINA ***'));
  lines.push(centerText('================================'));
  lines.push(`ORDEN: #${order.dailyNumber || order.id.slice(-4)}`);
  lines.push(`MESA:  ${order.isWaiterPersonalOrder ? 'PERSONAL / BARRA' : '#' + order.tableNumber}`);
  lines.push(`MESERO: ${order.waiterName}`);
  lines.push(`HORA:   ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
  lines.push(divider);
  lines.push('CANT  DESCRIPCION');
  lines.push(divider);

  order.items.forEach((item) => {
    const qtyStr = `${item.quantity}x`.padEnd(6, ' ');
    lines.push(qtyStr + item.productName);
    if (item.notes) {
      lines.push(`  * NOTA: ${item.notes}`);
    }
  });

  lines.push(divider);
  if (order.cancellationReason) {
    lines.push(`OBSERVACION: ${order.cancellationReason}`);
  }
  lines.push('\n\n\n');

  const rawText = lines.join('\n');
  const escPosText =
    ESC_POS.INIT +
    ESC_POS.ALIGN_CENTER +
    ESC_POS.BOLD_ON +
    '*** COMANDA COCINA ***\n' +
    ESC_POS.BOLD_OFF +
    ESC_POS.ALIGN_LEFT +
    rawText +
    ESC_POS.FEED_3_LINES +
    ESC_POS.CUT_FULL;

  return {
    rawText,
    escPosBytes: stringToEscPosBytes(escPosText),
  };
}

/**
 * FORMATO 2: Comanda de Adición (Rondas posteriores en mesa ocupada)
 */
export function generateAdditionComanda(additionOrder: RestaurantOrder): FormattedTicket {
  const divider = '-'.repeat(LINE_WIDTH);
  const lines: string[] = [];

  lines.push(centerText('================================'));
  lines.push(centerText('*** COMANDA DE ADICIÓN ***'));
  lines.push(centerText('================================'));
  lines.push(`ORDEN: #${additionOrder.dailyNumber || additionOrder.id.slice(-4)}`);
  lines.push(`MESA:  #${additionOrder.tableNumber} (RONDA EXTRA)`);
  lines.push(`MESERO: ${additionOrder.waiterName}`);
  lines.push(`HORA:   ${new Date(additionOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
  lines.push(divider);
  lines.push('CANT  NUEVA ADICION');
  lines.push(divider);

  additionOrder.items.forEach((item) => {
    const qtyStr = `${item.quantity}x`.padEnd(6, ' ');
    lines.push(qtyStr + item.productName);
    if (item.notes) {
      lines.push(`  * NOTA: ${item.notes}`);
    }
  });

  lines.push(divider);
  lines.push(centerText('*** DESPACHAR PRIORITARIO ***'));
  lines.push('\n\n\n');

  const rawText = lines.join('\n');
  return {
    rawText,
    escPosBytes: stringToEscPosBytes(ESC_POS.INIT + rawText + ESC_POS.CUT_FULL),
  };
}

/**
 * FORMATO 3: Pre-cuenta del Cliente (Desglose fiscal, IVA incl, propina sugerida)
 */
export function generateCustomerBill(
  order: RestaurantOrder,
  config: RestaurantConfig | null
): FormattedTicket {
  const divider = '-'.repeat(LINE_WIDTH);
  const doubleDivider = '='.repeat(LINE_WIDTH);
  const lines: string[] = [];

  const restaurantName = config?.restaurantName || 'SABOR & FUEGO BISTRO';
  const nit = config?.legalDocument || 'NIT: 901.482.119-3';
  const address = config?.address || 'Cra. 43A #7-50';
  const phone = config?.phone || 'Tel: 314 464 0776';

  lines.push(centerText(restaurantName));
  lines.push(centerText(nit));
  lines.push(centerText(address));
  lines.push(centerText(phone));
  lines.push(doubleDivider);
  lines.push(centerText('*** PRE-CUENTA DE CONSUMO ***'));
  lines.push(doubleDivider);
  lines.push(`MESA:   #${order.tableNumber}`);
  lines.push(`ORDEN:  #${order.dailyNumber || order.id.slice(-4)}`);
  lines.push(`MESERO: ${order.waiterName}`);
  lines.push(`FECHA:  ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  lines.push(divider);
  lines.push(formatTwoColumns('CANT DESCRIPCION', 'TOTAL'));
  lines.push(divider);

  order.items.forEach((item) => {
    const totalItem = formatReceiptCurrency(item.subtotal);
    const leftText = `${item.quantity}x ${item.productName}`;
    lines.push(formatTwoColumns(leftText, totalItem));
  });

  lines.push(divider);
  lines.push(formatTwoColumns('SUBTOTAL NETO:', formatReceiptCurrency(order.subtotal)));

  // Propina sugerida voluntaria del 10%
  const tip10 = Math.round(order.subtotal * 0.10);
  lines.push(formatTwoColumns('PROPINA SUGERIDA (10%):', formatReceiptCurrency(tip10)));
  lines.push(doubleDivider);

  const grandTotal = order.subtotal + tip10;
  lines.push(formatTwoColumns('TOTAL CON PROPINA:', formatReceiptCurrency(grandTotal)));
  lines.push(formatTwoColumns('TOTAL SIN PROPINA:', formatReceiptCurrency(order.subtotal)));
  lines.push(doubleDivider);

  lines.push(centerText('PRECIOS CON IVA INCLUIDO'));
  lines.push(centerText('Comprobante de consumo interno'));
  lines.push(centerText('No valido como factura fiscal'));
  lines.push(centerText('¡Gracias por su visita!'));
  lines.push('\n\n\n');

  const rawText = lines.join('\n');
  return {
    rawText,
    escPosBytes: stringToEscPosBytes(ESC_POS.INIT + rawText + ESC_POS.CUT_FULL),
  };
}

/**
 * Driver de Impresión: Intenta Web Bluetooth, luego Web Serial,
 * y en modo desarrollo/contingencia almacena en log virtual sin trabar la app.
 */
export async function sendEscPosToPrinter(
  ticket: FormattedTicket,
  printerName = 'POS-5890U-L'
): Promise<{ success: boolean; method: 'bluetooth' | 'serial' | 'virtual'; message: string }> {
  // 1. Intentar Web Bluetooth si el navegador lo soporta y el usuario lo tiene habilitado
  if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
    try {
      const navAny = navigator as any;
      const device = await navAny.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'], // Servicio genérico de impresora térmica
      });

      if (device && device.gatt) {
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
        await characteristic.writeValue(ticket.escPosBytes);
        return { success: true, method: 'bluetooth', message: 'Impreso por Bluetooth exitosamente' };
      }
    } catch (err: any) {
      console.info('[printerService] Bluetooth no conectado o cancelado:', err?.message);
    }
  }

  // 2. Intentar Web Serial (Cable USB directo en Chrome / Edge)
  if (typeof navigator !== 'undefined' && 'serial' in navigator) {
    try {
      const navAny = navigator as any;
      const port = await navAny.serial.requestPort();
      await port.open({ baudRate: 9600 });
      const writer = port.writable.getWriter();
      await writer.write(ticket.escPosBytes);
      writer.releaseLock();
      await port.close();
      return { success: true, method: 'serial', message: 'Impreso por USB Serial exitosamente' };
    } catch (err: any) {
      console.info('[printerService] Puerto USB Serial no disponible o cancelado:', err?.message);
    }
  }

  // 3. Fallback Determinista: Simulador Virtual Activo
  console.log('[printerService - SIMULADOR 32 COLS]:\n' + ticket.rawText);
  return {
    success: true,
    method: 'virtual',
    message: 'Comanda despachada correctamente (Visualizada en Simulador Térmico)',
  };
}
