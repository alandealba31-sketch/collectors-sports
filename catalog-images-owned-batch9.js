// Imágenes promocionales oficiales Topps revisadas visualmente. Referencias por entrada; no son escaneos exactos.
(() => {
  if (!window.CS_IMAGE_CATALOG) return;
  const id = 'topps-chrome-ufc-2026';
  const page = 'https://www.topps.com/pages/topps-chrome-ufc';
  const rows = [
    ['BAV-JD','Base Cards Autograph Variations|Jack Della Maddalena','Gold Refractor /50','Jack Della Maddalena','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt7efb10c579a308dc/69c6add6dfb8e01184dfa153/26UFCC_1217_FR.jpg'],
    ['SP-13','Split Decision|Khabib Nurmagomedov / Conor McGregor','Promoción','Khabib Nurmagomedov / Conor McGregor','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt8a422ed9288f4dcd/69c6adea310e3451c05f130c/26UFCC_2404_FR.jpg'],
    ['IP-6','Impact Point|Tom Aspinall','Orange Refractor /25','Tom Aspinall','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/bltab70caed7595babf/69c6adfb170eae3798b11486/26UFCC_2500_FR.jpg'],
    ['MOC-DC','Marks of Champions|Daniel Cormier','Gold Refractor /50','Daniel Cormier','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blta6e0f1abe50ce7a1/69c6ae0b170eaef80bb1148a/26UFCC_2710_FR.jpg'],
    ['HX-5','Helix|Youssef Zalal','Promoción','Youssef Zalal','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt3c5a0b01c665a450/69c6ae1b170eae7ff3b1148e/26UFCC_3203_FR.jpg'],
    ['86S-JA','1986 Topps Signatures|José Aldo','Orange Refractor /25','José Aldo','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt354b9b61f7671926/69c6af4e7e9d072be42833de/26UFCC_2850_FR.jpg'],
    ['OLA-GS','Octagon Legends Autographs|Georges St-Pierre','Promoción','Georges St-Pierre','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt71f766f230b9e6c7/69c6b0ae2cdc8a7bfc1d2a04/26UFCC_3502_FR.jpg'],
    ['LG-3',"Let's Go|Alex Pereira",'Promoción','Alex Pereira','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt19dec32b3d156d7c/69c6aff7b327b8577203c8dd/26UFCC_2931_FR.jpg'],
    ['RR-15','Radiating Rookies|Patricio Freire','Promoción','Patricio Freire','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt0b81242a62fd3800/69c6b035ff7047d43b10e58e/26UFCC_2992_FR.jpg'],
    ['IF-21','Immortal Force|Islam Makhachev','Promoción','Islam Makhachev','https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/bltabc41dd6a1910a55/69c6af22869fc930ce7053b2/26UFCC_2806_FR.jpg']
  ];
  for (const [number,entryKey,variant,player,front] of rows) {
    window.CS_IMAGE_CATALOG.cards[`${id}|${number}|${entryKey}`] = {
      front,
      kind: 'reference',
      variant,
      source: 'Topps oficial',
      sourcePage: page,
      sourceImageUrl: front,
      label: `${player} #${number} · ${variant} · Imagen promocional`,
      verifiedAt: '2026-10-02'
    };
  }
})();
