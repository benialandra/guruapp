# EduManage - Sistem Manajemen & Penilaian Akademik

EduManage adalah aplikasi web berbasis Google Apps Script yang dirancang untuk membantu sekolah dalam mengelola data akademik siswa secara efisien. Aplikasi ini menyediakan antarmuka yang modern dan mudah digunakan untuk manajemen siswa, penilaian, presensi, dan pelaporan.

## ✨ Fitur Utama

-   **Dashboard Analitik**: Visualisasi data kunci seperti total siswa, persentase kehadiran, tren nilai per mata pelajaran, dan status kelulusan siswa dalam bentuk grafik interaktif.
-   **Manajemen Database Siswa**:
    -   Operasi CRUD (Create, Read, Update, Delete) untuk data siswa.
    -   Import dan Export data siswa menggunakan format Excel (.xlsx).
    -   Pembuatan kartu barcode untuk setiap siswa.
-   **Sistem Penilaian (Gradebook)**:
    -   Input nilai per-kategori (Tugas, Latihan, UTS, UAS) untuk setiap mata pelajaran.
    -   Perhitungan nilai total dan pemeringkatan siswa secara otomatis.
    -   Sistem evaluasi sikap dan perilaku siswa dengan rating bintang dan catatan.
-   **Presensi Real-time**:
    -   Scanner barcode menggunakan kamera perangkat untuk mencatat kehadiran siswa secara otomatis.
    -   Log kehadiran real-time.
    -   Daftar siswa yang belum hadir pada hari tersebut dengan opsi untuk menandai status (Sakit, Izin, Alfa).
-   **Laporan PDF**: Cetak profil dan laporan evaluasi belajar lengkap untuk setiap siswa dalam format PDF.
-   **Antarmuka Modern**:
    -   Desain responsif yang dibuat dengan TailwindCSS.
    -   Mode Terang (Light) dan Gelap (Dark).
    -   Komponen UI interaktif seperti notifikasi, modal, dan dropdown.

## 🚀 Teknologi yang Digunakan

-   **Backend**: Google Apps Script (JavaScript)
-   **Database**: Google Sheets
-   **Frontend**: HTML, JavaScript
-   **Styling**: TailwindCSS
-   **Library**:
    -   Chart.js: Untuk grafik dan visualisasi data.
    -   SweetAlert2: Untuk notifikasi dan popup yang menarik.
    -   html5-qrcode: Untuk fungsionalitas pemindai barcode.
    -   JsBarcode: Untuk menghasilkan gambar barcode.
    -   xlsx.js: Untuk memproses file Excel (import/export).
    -   html2pdf.js: Untuk menghasilkan file PDF.

## 🗂️ Skema Database (Google Sheets)

Aplikasi ini menggunakan satu Google Sheet sebagai databasenya, yang terdiri dari beberapa sheet:

1.  **`Data User`**: Menyimpan data login pengguna (administrator).
    -   `Username`
    -   `Password`
    -   `Nama_Lengkap`
2.  **`Data Siswa`**: Informasi lengkap mengenai setiap siswa.
    -   `NIS`, `Nama`, `Kelamin`, `Agama`, `Tempat_Lahir`, `Tanggal_Lahir`, `Nama_Ibu`, `Nama_Ayah`, `Alamat`, `Kelas`, `Status` (Aktif/Lulus/Pindah), `No_WhatsApp_Ortu`, `Tgl_Update`
3.  **`Presensi`**: Log semua catatan kehadiran.
    -   `Waktu` (Timestamp)
    -   `NIS`
    -   `Status` (Hadir, Sakit, Izin, Alfa)
4.  **`Data Mapel`**: Daftar mata pelajaran yang ada.
    -   `Nama_Mapel`
    -   `Tgl_Ditambahkan`
5.  **`Data Nilai`**: Menyimpan nilai akademik siswa per mata pelajaran.
    -   `NIS`, `Nama_Mapel`, `Latihan1` s/d `Latihan5`, `UTS`, `UAS`
6.  **`Data Perilaku`**: Menyimpan evaluasi sikap dan perilaku.
    -   `NIS`
    -   `Rating_Bintang` (1-5)
    -   `Komentar`

## ⚙️ Instalasi & Deployment

Proyek ini menggunakan `clasp` (Command Line Apps Script Projects) untuk pengembangan lokal.

1.  **Prasyarat**:
    -   Node.js dan npm terinstal.
    -   Login ke akun Google Anda.

2.  **Instalasi `clasp`**:
    ```bash
    npm install -g @google/clasp
    ```

3.  **Login ke `clasp`**:
    ```bash
    clasp login
    ```

4.  **Clone Proyek (jika ada repositori git)** atau buat proyek baru:
    ```bash
    # Untuk clone
    git clone <url-repositori>
    cd <nama-folder>
    clasp pull

    # Untuk membuat proyek baru dari awal
    clasp create --title "EduManage" --type webapp
    ```
    Pastikan file `.clasp.json` Anda berisi `scriptId` yang benar.

5.  **Dorong Perubahan ke Apps Script**:
    Setelah melakukan perubahan pada file lokal (`Code.js`, `Index.html`), dorong perubahan tersebut ke Google Apps Script:
    ```bash
    clasp push
    ```

6.  **Deployment**:
    -   Buka proyek di editor Google Apps Script (`clasp open`).
    -   Klik `Deploy` > `New deployment`.
    -   Pilih `Web app` sebagai tipe deployment.
    -   Pada konfigurasi:
        -   **Execute as**: `Me` atau `User accessing the web app`.
        -   **Who has access**: `Anyone` (jika ingin bisa diakses publik) atau batasi sesuai kebutuhan.
    -   Klik `Deploy`. Anda akan mendapatkan URL web app yang bisa digunakan.

---
_README.md ini dibuat secara otomatis berdasarkan analisis kode proyek._
