import { apiRequest } from './api.js';

async function loadInvoices() {
    const result = await apiRequest('/invoices');
    if (result.success) {
        const invoiceList = document.getElementById('invoiceList');
        invoiceList.innerHTML = '';
        result.data.forEach(invoice => {
            const qrId = `qr-${invoice.id}`;
            invoiceList.innerHTML += `
                <tr>
                    <td>${invoice.id}</td>
                    <td>${invoice.date}</td>
                    <td>${invoice.total} VND</td>
                    <td>${invoice.status}</td>
                    <td><div id="${qrId}"></div></td>
                </tr>
            `;
            new QRCode(document.getElementById(qrId), {
                text: `Invoice ID: ${invoice.id}`,
                width: 100,
                height: 100
            });
        });
    }
}

loadInvoices();