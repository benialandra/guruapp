const SHEET_ID = '1XSjtwq3cKFeC4Zg3EqKCC_yFshFWrT7vFoPGKwfeSSM';
const KKM_LULUS = 95;

function doGet(e) {
    let result = { success: false, message: "Aksi tidak dikenali." };
    try {
        const action = e.parameter.action;
        if (action === 'getStudents') result = { success: true, data: getStudents() };
        else if (action === 'getDashboardData') result = { success: true, data: getDashboardData() };
        else if (action === 'getMapelData') result = { success: true, data: getMapelList() };
        else if (action === 'getNilaiLengkap') result = { success: true, data: getNilaiLengkap(e.parameter.mapel) };
        else if (action === 'getTodayAttendance') result = { success: true, data: getTodayAttendance() };
        else if (action === 'getSiswaDetail') result = { success: true, data: getSiswaDetail(e.parameter.nis) };
    } catch (error) { result.message = error.toString(); }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    let result = { success: false, message: "Aksi tidak dikenali." };
    try {
        const payload = JSON.parse(e.postData.contents);
        const action = payload.action; const data = payload.data;

        if (action === 'verifyLogin') result = verifyLogin(data.username, data.password);
        else if (action === 'addStudent') result = addStudent(data);
        else if (action === 'updateStudent') result = updateStudent(data);
        else if (action === 'deleteStudent') result = deleteStudent(data.nis);
        else if (action === 'recordAttendance') result = recordAttendance(data.nis);
        else if (action === 'markAbsence') result = markAbsence(data);
        else if (action === 'addMapel') result = addMapel(data.mapel);
        else if (action === 'saveNilaiKategori') result = saveNilaiKategori(data);
        else if (action === 'savePerilaku') result = savePerilaku(data);
        else if (action === 'importStudents') result = importStudents(data);
        else if (action === 'importNilai') result = importNilai(data);
    } catch (error) { result.message = "Error: " + error.toString(); }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function initDatabase() {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const reqSheets = {
        'Data User': ['Username', 'Password', 'Nama_Lengkap'],
        // UPDATE HEADER DATA SISWA
        'Data Siswa': ['NIS', 'Nama', 'Kelamin', 'Agama', 'Tempat_Lahir', 'Tanggal_Lahir', 'Nama_Ibu', 'Nama_Ayah', 'Alamat', 'Kelas', 'Status', 'No_WhatsApp_Ortu', 'Tgl_Update'],
        'Presensi': ['Waktu', 'NIS', 'Status'],
        'Data Mapel': ['Nama_Mapel', 'Tgl_Ditambahkan'],
        'Data Nilai': ['NIS', 'Nama_Mapel', 'Latihan1', 'Latihan2', 'Latihan3', 'UTS', 'Latihan4', 'Latihan5', 'UAS'],
        'Data Perilaku': ['NIS', 'Rating_Bintang', 'Komentar']
    };
    for (let sheetName in reqSheets) {
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) { sheet = ss.insertSheet(sheetName); sheet.appendRow(reqSheets[sheetName]); sheet.getRange(1, 1, 1, reqSheets[sheetName].length).setFontWeight("bold").setBackground("#d2e3fc"); }
    }
    return "Database siap digunakan!";
}

function getDashboardData() {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const dSiswa = ss.getSheetByName('Data Siswa').getDataRange().getValues();
    const dPresensi = ss.getSheetByName('Presensi').getDataRange().getValues();
    const dNilai = ss.getSheetByName('Data Nilai').getDataRange().getValues();
    const dPerilaku = ss.getSheetByName('Data Perilaku').getDataRange().getValues();

    let totalSiswa = 0; let mapSiswa = {};
    for (let i = 1; i < dSiswa.length; i++) {
        if (dSiswa[i][10] === 'AKTIF' || dSiswa[i][10] === '') {
            totalSiswa++;
            // MENANGKAP NO WHATSAPP (Index 11)
            mapSiswa[dSiswa[i][0]] = { nis: dSiswa[i][0], nama: dSiswa[i][1], kelamin: dSiswa[i][2], agama: dSiswa[i][3], tempatLahir: dSiswa[i][4], tanggalLahir: dSiswa[i][5], namaIbu: dSiswa[i][6], namaAyah: dSiswa[i][7], alamat: dSiswa[i][8], kelas: dSiswa[i][9], status: dSiswa[i][10], noWhatsAppOrtu: dSiswa[i][11], totalHadir: 0, totalNilai: 0, countMapel: 0, rating: 0, komentar: '-' };
        }
    }

    const hariIni = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Jakarta", "dd/MM/yyyy");
    let mapHadirHariIni = {};
    for (let i = 1; i < dPresensi.length; i++) {
        let wkt = dPresensi[i][0].toString(); let nis = dPresensi[i][1]; let statusPre = dPresensi[i][2] || 'HADIR';
        if (statusPre === 'HADIR' && mapSiswa[nis]) mapSiswa[nis].totalHadir++;
        if (wkt.includes(hariIni)) mapHadirHariIni[nis] = { jam: wkt.split(' ')[1], status: statusPre };
    }
    let hadirHariIni = 0; for (let key in mapHadirHariIni) { if (mapHadirHariIni[key].status === 'HADIR') hadirHariIni++; }
    const persenHadirHariIni = totalSiswa > 0 ? ((hadirHariIni / totalSiswa) * 100).toFixed(1) : 0;

    let sumMapel = {};
    for (let i = 1; i < dNilai.length; i++) {
        let nis = dNilai[i][0]; let mapel = dNilai[i][1];
        let scores = dNilai[i].slice(2, 9).map(v => parseFloat(v) || 0);
        let avgMapel = scores.reduce((a, b) => a + b, 0) / 7;
        if (!sumMapel[mapel]) sumMapel[mapel] = { total: 0, count: 0 };
        sumMapel[mapel].total += avgMapel; sumMapel[mapel].count++;
        if (mapSiswa[nis]) { mapSiswa[nis].totalNilai += avgMapel; mapSiswa[nis].countMapel++; }
    }

    let chartLineLabels = []; let chartLineData = []; let chartLineCounts = [];
    for (let m in sumMapel) { chartLineLabels.push(m); chartLineData.push(parseFloat((sumMapel[m].total / sumMapel[m].count).toFixed(2))); chartLineCounts.push(sumMapel[m].count); }

    let lulus = 0; let tidakLulus = 0;
    for (let nis in mapSiswa) {
        let avgTotalSiswa = mapSiswa[nis].countMapel > 0 ? (mapSiswa[nis].totalNilai / mapSiswa[nis].countMapel) : 0;
        mapSiswa[nis].rataNilai = parseFloat(avgTotalSiswa.toFixed(2));
        if (mapSiswa[nis].countMapel > 0) { if (avgTotalSiswa >= KKM_LULUS) lulus++; else tidakLulus++; }
    }

    for (let i = 1; i < dPerilaku.length; i++) { let nis = dPerilaku[i][0]; if (mapSiswa[nis]) { mapSiswa[nis].rating = dPerilaku[i][1]; mapSiswa[nis].komentar = dPerilaku[i][2]; } }

    let tableDashboard = [];
    for (let nis in mapSiswa) { mapSiswa[nis].jamAkhirHariIni = mapHadirHariIni[nis] ? mapHadirHariIni[nis].jam : '-'; tableDashboard.push(mapSiswa[nis]); }

    return { cards: { totalSiswa: totalSiswa, hadirHariIni: hadirHariIni, persenHadir: persenHadirHariIni }, charts: { line: { labels: chartLineLabels, data: chartLineData, counts: chartLineCounts }, donut: { labels: ['Lulus', 'Tidak Lulus'], data: [lulus, tidakLulus] } }, table: tableDashboard };
}

function getMapelList() { const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data Mapel'); if (!sheet) return []; const data = sheet.getDataRange().getValues(); let list = []; for (let i = 1; i < data.length; i++) if (data[i][0] !== '') list.push(data[i][0]); return list; }
function addMapel(mapelBaru) { const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data Mapel'); const data = sheet.getDataRange().getValues(); for (let i = 1; i < data.length; i++) { if (data[i][0].toString().toUpperCase() === mapelBaru.toUpperCase()) return { success: false, message: "Mata Pelajaran sudah ada!" }; } const tgl = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss"); sheet.appendRow([mapelBaru.toUpperCase(), tgl]); return { success: true, message: "Mata Pelajaran ditambahkan!" }; }
function getNilaiLengkap(mapelDipilih) {
    const ss = SpreadsheetApp.openById(SHEET_ID); const dSiswa = ss.getSheetByName('Data Siswa').getDataRange().getValues(); const dNilai = ss.getSheetByName('Data Nilai').getDataRange().getValues(); const dPerilaku = ss.getSheetByName('Data Perilaku').getDataRange().getValues();
    let resultList = []; if (!mapelDipilih || mapelDipilih === '') return [];
    for (let i = 1; i < dSiswa.length; i++) {
        let nis = dSiswa[i][0]; let objSiswa = { nis: nis, nama: dSiswa[i][1], mapel: mapelDipilih, l1: 0, l2: 0, l3: 0, uts: 0, l4: 0, l5: 0, uas: 0, total: 0, rating: 0, komentar: '' };
        for (let j = 1; j < dNilai.length; j++) { if (dNilai[j][0] == nis && dNilai[j][1] === mapelDipilih) { objSiswa.l1 = parseFloat(dNilai[j][2]) || 0; objSiswa.l2 = parseFloat(dNilai[j][3]) || 0; objSiswa.l3 = parseFloat(dNilai[j][4]) || 0; objSiswa.uts = parseFloat(dNilai[j][5]) || 0; objSiswa.l4 = parseFloat(dNilai[j][6]) || 0; objSiswa.l5 = parseFloat(dNilai[j][7]) || 0; objSiswa.uas = parseFloat(dNilai[j][8]) || 0; break; } }
        objSiswa.total = objSiswa.l1 + objSiswa.l2 + objSiswa.l3 + objSiswa.uts + objSiswa.l4 + objSiswa.l5 + objSiswa.uas;
        for (let k = 1; k < dPerilaku.length; k++) { if (dPerilaku[k][0] == nis) { objSiswa.rating = dPerilaku[k][1]; objSiswa.komentar = dPerilaku[k][2]; break; } } resultList.push(objSiswa);
    }
    resultList.sort((a, b) => b.total - a.total); for (let i = 0; i < resultList.length; i++) resultList[i].peringkat = i + 1; return resultList;
}
function saveNilaiKategori(data) { const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data Nilai'); const dNilai = sheet.getDataRange().getValues(); const mapKolom = { 'LATIHAN 1': 3, 'LATIHAN 2': 4, 'LATIHAN 3': 5, 'UTS': 6, 'LATIHAN 4': 7, 'LATIHAN 5': 8, 'UAS': 9 }; let colIndex = mapKolom[data.kategori.toUpperCase()]; if (!colIndex) return { success: false, message: "Kategori tidak valid" }; let barisDitemukan = -1; for (let i = 1; i < dNilai.length; i++) { if (dNilai[i][0] == data.nis && dNilai[i][1] == data.mapel) { barisDitemukan = i + 1; break; } } if (barisDitemukan !== -1) { sheet.getRange(barisDitemukan, colIndex).setValue(data.nilai); } else { let newRow = [data.nis, data.mapel, 0, 0, 0, 0, 0, 0, 0]; newRow[colIndex - 1] = data.nilai; sheet.appendRow(newRow); } return { success: true, message: "Nilai berhasil disimpan" }; }
function savePerilaku(data) { const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data Perilaku'); const dPerilaku = sheet.getDataRange().getValues(); for (let i = 1; i < dPerilaku.length; i++) { if (dPerilaku[i][0] == data.nis) { sheet.getRange(i + 1, 2).setValue(data.rating); sheet.getRange(i + 1, 3).setValue(data.komentar); return { success: true, message: "Diperbarui" }; } } sheet.appendRow([data.nis, data.rating, data.komentar]); return { success: true, message: "Disimpan" }; }
function getSiswaDetail(nis) { const ss = SpreadsheetApp.openById(SHEET_ID); const sheetNilai = ss.getSheetByName('Data Nilai'); if (!sheetNilai) return []; const dNilai = sheetNilai.getDataRange().getValues(); let detail = []; for (let i = 1; i < dNilai.length; i++) { if (dNilai[i][0] == nis) { let l1 = parseFloat(dNilai[i][2]) || 0, l2 = parseFloat(dNilai[i][3]) || 0, l3 = parseFloat(dNilai[i][4]) || 0, uts = parseFloat(dNilai[i][5]) || 0, l4 = parseFloat(dNilai[i][6]) || 0, l5 = parseFloat(dNilai[i][7]) || 0, uas = parseFloat(dNilai[i][8]) || 0; let total = l1 + l2 + l3 + uts + l4 + l5 + uas; let rata = parseFloat((total / 7).toFixed(2)); detail.push({ mapel: dNilai[i][1], l1: l1, l2: l2, l3: l3, uts: uts, l4: l4, l5: l5, uas: uas, total: total, rata: rata }); } } return detail; }

// ==========================================
// IMPORT EXCEL DATA SISWA (BARU: WA ORTU)
// ==========================================
function importStudents(studentsArray) {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data Siswa'); const dbData = sheet.getDataRange().getValues();
        const existingNis = new Set(); for (let i = 1; i < dbData.length; i++) existingNis.add(dbData[i][0].toString());
        let newRows = []; const tglUpdate = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
        let countAdded = 0; let countSkipped = 0;
        for (let i = 0; i < studentsArray.length; i++) {
            let s = studentsArray[i]; let nisStr = s.nis ? s.nis.toString().trim() : "";
            if (!nisStr) { countSkipped++; continue; }
            if (!existingNis.has(nisStr)) {
                // Index 11 adalah No. WA
                newRows.push([nisStr, s.nama || "-", s.kelamin || "-", s.agama || "-", s.tempatLahir || "-", s.tanggalLahir || "-", s.namaIbu || "-", s.namaAyah || "-", s.alamat || "-", s.kelas || "-", s.status || "AKTIF", s.noWhatsAppOrtu || "-", tglUpdate]);
                existingNis.add(nisStr); countAdded++;
            } else countSkipped++;
        }
        if (newRows.length > 0) sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
        return { success: true, message: `Sukses import: ${countAdded} data.
Dilewati (Duplikat/Kosong): ${countSkipped} baris.` };
    } catch (e) { return { success: false, message: e.toString() }; }
}

function importNilai(payload) {
    try {
        const ss = SpreadsheetApp.openById(SHEET_ID); const sheetSiswa = ss.getSheetByName('Data Siswa'); const sheetNilai = ss.getSheetByName('Data Nilai'); const sheetPerilaku = ss.getSheetByName('Data Perilaku');
        let dSiswa = sheetSiswa.getDataRange().getValues(); let dNilai = sheetNilai.getDataRange().getValues(); let dPerilaku = sheetPerilaku.getDataRange().getValues();
        const validNis = new Set(); for (let i = 1; i < dSiswa.length; i++) validNis.add(dSiswa[i][0].toString());
        let countAdded = 0; let countUpdated = 0; let countSkipped = 0;
        let mapNilai = {}; for (let i = 1; i < dNilai.length; i++) mapNilai[`${dNilai[i][0]}_${dNilai[i][1]}`] = i + 1; let mapPerilaku = {}; for (let i = 1; i < dPerilaku.length; i++) mapPerilaku[dPerilaku[i][0]] = i + 1;
        payload.forEach(row => {
            if (!row.nis || !row.mapel) return; let nisStr = row.nis.toString();
            if (!validNis.has(nisStr)) { countSkipped++; return; }
            let key = `${nisStr}_${row.mapel}`; let nRow = mapNilai[key];
            if (nRow) { sheetNilai.getRange(nRow, 3, 1, 7).setValues([[row.l1 || 0, row.l2 || 0, row.l3 || 0, row.uts || 0, row.l4 || 0, row.l5 || 0, row.uas || 0]]); countUpdated++; } else { sheetNilai.appendRow([nisStr, row.mapel, row.l1 || 0, row.l2 || 0, row.l3 || 0, row.uts || 0, row.l4 || 0, row.l5 || 0, row.uas || 0]); countAdded++; mapNilai[key] = sheetNilai.getLastRow(); }
            if (row.rating !== undefined || row.komentar !== undefined) { let pRow = mapPerilaku[nisStr]; if (pRow) { sheetPerilaku.getRange(pRow, 2, 1, 2).setValues([[row.rating || 0, row.komentar || ""]]); } else { sheetPerilaku.appendRow([nisStr, row.rating || 0, row.komentar || ""]); mapPerilaku[nisStr] = sheetPerilaku.getLastRow(); } }
        });
        return { success: true, message: `Disimpan: ${countAdded} | Diperbarui: ${countUpdated}
Dilewati (NIS Tidak Ada): ${countSkipped}` };
    } catch (e) { return { success: false, message: e.toString() }; }
}

function verifyLogin(username, password) { const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data User'); if (!sheet) return { success: false, message: "DB Error" }; const data = sheet.getDataRange().getValues(); for (let i = 1; i < data.length; i++) { if (data[i][0] === username && data[i][1].toString() === password) return { success: true, message: "Login Berhasil" }; } return { success: false, message: "Username atau Password salah!" }; }
function getStudents() {
    const data = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data Siswa').getDataRange().getDisplayValues(); let students = [];
    // AMBIL INDEX 11 WA ORTU
    for (let i = 1; i < data.length; i++) students.push({ nis: data[i][0], nama: data[i][1], kelamin: data[i][2], agama: data[i][3], tempatLahir: data[i][4], tanggalLahir: data[i][5], namaIbu: data[i][6], namaAyah: data[i][7], alamat: data[i][8], kelas: data[i][9], status: data[i][10], noWhatsAppOrtu: data[i][11] }); return students;
}
function addStudent(data) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data Siswa'); const dbData = sheet.getDataRange().getValues();
    for (let i = 1; i < dbData.length; i++) if (dbData[i][0] == data.nis) return { success: false, message: "NIS sudah terdaftar!" };
    const tglUpdate = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
    sheet.appendRow([data.nis, data.nama, data.kelamin, data.agama, data.tempatLahir, data.tanggalLahir, data.namaIbu, data.namaAyah, data.alamat, data.kelas, data.status, data.noWhatsAppOrtu, tglUpdate]); return { success: true, message: "Tersimpan!" };
}
function updateStudent(data) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data Siswa'); const dbData = sheet.getDataRange().getValues();
    for (let i = 1; i < dbData.length; i++) { if (dbData[i][0] == data.nisLama) { const tglUpdate = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss"); sheet.getRange(i + 1, 1, 1, 13).setValues([[data.nis, data.nama, data.kelamin, data.agama, data.tempatLahir, data.tanggalLahir, data.namaIbu, data.namaAyah, data.alamat, data.kelas, data.status, data.noWhatsAppOrtu, tglUpdate]]); return { success: true, message: "Diperbarui!" }; } } return { success: false, message: "Tidak ditemukan!" };
}
function deleteStudent(nis) { const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Data Siswa'); const data = sheet.getDataRange().getValues(); for (let i = 1; i < data.length; i++) { if (data[i][0] == nis) { sheet.deleteRow(i + 1); return { success: true, message: "Terhapus!" }; } } return { success: false, message: "Tidak ditemukan!" }; }
function recordAttendance(nis) {
    try {
        const ss = SpreadsheetApp.openById(SHEET_ID); const dSiswa = ss.getSheetByName('Data Siswa').getDataRange().getValues();
        let namaSiswa = ""; for (let i = 1; i < dSiswa.length; i++) { if (dSiswa[i][0] == nis) { namaSiswa = dSiswa[i][1]; break; } }
        if (namaSiswa === "") return { success: false, message: `NIS ${nis} tidak terdaftar!` };
        const tglWaktu = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
        ss.getSheetByName('Presensi').appendRow([tglWaktu, nis, 'HADIR']); return { success: true, data: { nis: nis, nama: namaSiswa, waktu: tglWaktu } };
    } catch (error) { return { success: false, message: error.toString() }; }
}
function markAbsence(data) { try { const sheetPresensi = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Presensi'); const tglWaktu = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss"); sheetPresensi.appendRow([tglWaktu, data.nis, data.status.toUpperCase()]); return { success: true, message: `Status disimpan.` }; } catch (e) { return { success: false, message: e.toString() }; } }
function getTodayAttendance() {
    const ss = SpreadsheetApp.openById(SHEET_ID); const sheetPresensi = ss.getSheetByName('Presensi'); const sheetSiswa = ss.getSheetByName('Data Siswa');
    if (!sheetPresensi || !sheetSiswa) return { present: [], absent: [] };
    const dPresensi = sheetPresensi.getDataRange().getDisplayValues(); const dSiswa = sheetSiswa.getDataRange().getDisplayValues();
    let mapSiswa = {}; let allSiswa = [];
    for (let i = 1; i < dSiswa.length; i++) { if (dSiswa[i][10] === 'AKTIF' || dSiswa[i][10] === '') { mapSiswa[dSiswa[i][0]] = { nis: dSiswa[i][0], nama: dSiswa[i][1], kelas: dSiswa[i][9] }; allSiswa.push(dSiswa[i][0]); } }
    const hariIni = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Jakarta", "dd/MM/yyyy");
    let presentSet = new Set(); let tempPresensi = {};
    for (let i = 1; i < dPresensi.length; i++) { let wkt = dPresensi[i][0].toString(); if (wkt.includes(hariIni)) { let nis = dPresensi[i][1]; let status = dPresensi[i][2] || 'HADIR'; if (mapSiswa[nis]) { tempPresensi[nis] = { waktu: wkt, nis: nis, nama: mapSiswa[nis].nama, kelas: mapSiswa[nis].kelas, status: status }; presentSet.add(nis); } } }
    let presentList = []; for (let k in tempPresensi) presentList.push(tempPresensi[k]); presentList.sort((a, b) => b.waktu.localeCompare(a.waktu));
    let absentList = []; for (let i = 0; i < allSiswa.length; i++) { if (!presentSet.has(allSiswa[i])) absentList.push(mapSiswa[allSiswa[i]]); }
    return { present: presentList, absent: absentList };
}
