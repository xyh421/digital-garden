// Word uses an Open Packaging Convention container. Store its three XML parts in a ZIP.
function makeWord(rows){
  const wordNS='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const xmlText=value=>esc(String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,''));
  const paragraphs=rows.map(([type,value])=>'<w:p><w:r>'+(type==='h'?'<w:rPr><w:b/><w:sz w:val="30"/></w:rPr>':'')+'<w:t xml:space="preserve">'+xmlText(value)+'</w:t></w:r></w:p>').join('');
  const parts={
    '[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml':'<w:document xmlns:w="'+wordNS+'"><w:body>'+paragraphs+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>'
  };
  const encoder=new TextEncoder(), files=[], directory=[];
  let offset=0, directoryLength=0;
  for(const [name,xml] of Object.entries(parts)){
    const path=encoder.encode(name), bytes=encoder.encode('<?xml version="1.0" encoding="UTF-8"?>'+xml);
    let crc=0xffffffff;
    for(const byte of bytes){
      crc^=byte;
      for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
    }
    crc=(crc^0xffffffff)>>>0;
    const local=new DataView(new ArrayBuffer(30));
    local.setUint32(0,0x04034b50,true);
    local.setUint16(4,20,true);
    local.setUint16(12,33,true);
    local.setUint32(14,crc,true);
    local.setUint32(18,bytes.length,true);
    local.setUint32(22,bytes.length,true);
    local.setUint16(26,path.length,true);
    const central=new DataView(new ArrayBuffer(46));
    central.setUint32(0,0x02014b50,true);
    central.setUint16(4,20,true);
    central.setUint16(6,20,true);
    central.setUint16(14,33,true);
    central.setUint32(16,crc,true);
    central.setUint32(20,bytes.length,true);
    central.setUint32(24,bytes.length,true);
    central.setUint16(28,path.length,true);
    central.setUint32(42,offset,true);
    files.push(local.buffer,path,bytes);
    directory.push(central.buffer,path);
    offset+=local.byteLength+path.length+bytes.length;
    directoryLength+=central.byteLength+path.length;
  }
  const end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);
  end.setUint16(8,Object.keys(parts).length,true);
  end.setUint16(10,Object.keys(parts).length,true);
  end.setUint32(12,directoryLength,true);
  end.setUint32(16,offset,true);
  return new Blob([...files,...directory,end.buffer],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
