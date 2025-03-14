import { Alert } from 'react-native';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';

/**
 * Generates HTML content for bill printing
 */
export const generateBillHTML = (bill, total, customerName, showCalculationsInPrint, storeName, showCustomerNameInPrint, footerText, showProductNameInPrint, printFontSize = 'medium') => {
  // Process footer text to handle line breaks
  const formattedFooterText = footerText
    ? footerText.split('\n').map(line => `<div>${line}</div>`).join('')
    : 'Thank you!';

  // Format the total to ensure it's displayed properly
  const formattedTotal = typeof total === 'number' ? total.toFixed(2) : parseFloat(total).toFixed(2);

  // Set font size and margin based on printFontSize parameter
  let baseFontSize = '14px';
  let headerFontSize = '18px';
  let billItemFontSize = '22px';
  let totalFontSize = '20px';
  let itemMarginBottom = '4mm';
  
  if (printFontSize === 'small') {
    baseFontSize = '12px';
    headerFontSize = '16px';
    billItemFontSize = '18px';
    totalFontSize = '18px';
    itemMarginBottom = '2mm';
  } else if (printFontSize === 'large') {
    baseFontSize = '16px';
    headerFontSize = '22px';
    billItemFontSize = '26px';
    totalFontSize = '24px';
    itemMarginBottom = '6mm';
  }

  return `
    <html>
      <head>
        <style>
          @page { 
            size: 58mm auto;  /* Standard 2-inch thermal printer width */
            margin: 0mm;
          }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: ${baseFontSize}; 
            width: 58mm;
            padding: 4mm;
            margin: 0;
            color: #000000;
            -webkit-print-color-adjust: exact;
          }
          .header {
            text-align: center;
            font-size: ${headerFontSize};
            font-weight: 900;
            margin-bottom: 6mm;
            border-bottom: 2px dashed #000;
            padding-bottom: 4mm;
            color: #000000;
          }
          .bill-item { 
            margin-bottom: ${itemMarginBottom}; 
            font-size: ${billItemFontSize};
            display: flex;
            justify-content: space-between;
            font-weight: 700;
          }
          .item-serial {
            width: 10%;
            font-size: ${parseInt(billItemFontSize) - 2}px;
            color: #000000;
            font-weight: 700;
          }
          .item-expression { 
            max-width: 40%; 
            overflow: hidden;
            color: #000000;
            font-size: ${billItemFontSize};
            font-weight: 700;
          }
          .item-result { 
            text-align: right; 
            font-weight: 700;
            font-size: ${billItemFontSize};
            color: #000000;
          }
          .total-section {
            margin-top: 5mm;
            border-top: 2px dashed #000;
            padding-top: 4mm;
            font-weight: 900;
            font-size: ${totalFontSize};
            text-align: right;
            color: #000000;
          }
          .footer {
            margin-top: 6mm;
            text-align: center;
            font-size: ${parseInt(baseFontSize) - 2}px;
            font-weight: 700;
            border-top: 2px dashed #000;
            padding-top: 4mm;
            color: #000000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${storeName ? `<div style="font-size: 20px; font-weight: 900; margin-bottom: 2mm;">${storeName}</div>` : ''}
          ${showCustomerNameInPrint && customerName ? customerName : 'Receipt'}
          <br>${new Date().toLocaleString()}
        </div>
        
        ${bill.map((item, index) => {
          // Determine what to show for the expression part
          let expressionContent = '';
          
          if (item.isProduct) {
            // For product items
            if (showProductNameInPrint) {
              expressionContent = item.expression; // Show full product description with name and quantity
            } else {
              // Don't show anything when product name display is disabled
              expressionContent = ''; // Don't show quantity either
            }
          } else {
            // For regular calculation items
            expressionContent = showCalculationsInPrint ? item.expression : '';
          }

          // Format the result to ensure it's displayed properly
          const formattedResult = typeof item.result === 'number' ? item.result.toFixed(2) : parseFloat(item.result || 0).toFixed(2);
          
          return `
          <div class="bill-item">
            <span class="item-serial">${index + 1}.</span>
            ${expressionContent ? `<span class="item-expression">${expressionContent}</span>` : ''}
            <span class="item-result">${formattedResult}</span>
          </div>
          `;
        }).join('')}
        
        <div class="total-section">
          Total: ${formattedTotal}
        </div>
        
        <div class="footer">
          ${formattedFooterText}
        </div>
      </body>
    </html>
  `;
};

/**
 * Prints the bill using Expo's printing functionality
 */
export const printBill = async (bill, total, customerName, showCalculations, storeName, showCustomerName, footerText, showProductName = true, printFontSize = 'medium') => {
  try {
    const html = generateBillHTML(bill, total, customerName, showCalculations, storeName, showCustomerName, footerText, showProductName, printFontSize);
    
    // Generate PDF from HTML
    const { uri } = await printToFileAsync({ html });

    // Share the PDF
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    return true; // Successful print
  } catch (error) {
    Alert.alert('Error', 'Failed to print: ' + error.message);
    return false; // Failed print
  }
};
