export function serializeExcelXML(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Sheet1">
  <Table>\n`;

  // Headers
  xml += `   <Row>\n`;
  for (const h of headers) {
    xml += `    <Cell><Data ss:Type="String">${escapeXML(h)}</Data></Cell>\n`;
  }
  xml += `   </Row>\n`;

  // Data
  for (const row of rows) {
    xml += `   <Row>\n`;
    for (const h of headers) {
      const val = row[h];
      let type = 'String';
      if (typeof val === 'number') type = 'Number';
      
      if (val === null || val === undefined) {
         xml += `    <Cell><Data ss:Type="String"></Data></Cell>\n`;
      } else {
         xml += `    <Cell><Data ss:Type="${type}">${escapeXML(String(val))}</Data></Cell>\n`;
      }
    }
    xml += `   </Row>\n`;
  }

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  return xml;
}

function escapeXML(str: string): string {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
}
