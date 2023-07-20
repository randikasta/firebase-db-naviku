// menerapkan library nodeJS
const functions = require("firebase-functions");
const {Storage} = require("@google-cloud/storage");
const UUID = require(("uuid-v4"));
const express = require("express");
const formidable = require("formidable-serverless");
require("dotenv").config();

// menggunakan library express
const app = express();
app.use(express.json({limit: "50mb", extended: true}));
app.use(express.urlencoded({extended: false, limit: "50mb"}));
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// membuat variabel referensi pada table ruangan di firebase
const kategoriRef = admin.firestore().collection("kategori");
const ruanganRef = kategoriRef.doc("ruangan").collection("ruangan");
const bangunanRef = kategoriRef.doc("bangunan").collection("bangunan");
const bendaRef = kategoriRef.doc("benda").collection("benda");
const rambuRef = kategoriRef.doc("rambu").collection("rambu");
const angkaRef = kategoriRef.doc("angka").collection("angka");
const rarRef = kategoriRef.doc("rarfile").collection("rarfile");

// menyambungkan storage yang ada pada firebase
const storage = new Storage({
  keyFilename: "serviceAccount.json",
});

// route all data
app.get("/", async (req, res, next) => {
  try {
    const ruanganSnapshot = ruanganRef.get();
    const bangunanSnapshot = bangunanRef.get();
    const bendaSnapshot = bendaRef.get();
    const rambuSnapshot = rambuRef.get();
    const angkaSnapshot = angkaRef.get();
    const rarSnapshot = rarRef.get();

    const [ruanganData,
      bangunanData,
      bendaData,
      rambuData,
      angkaData,
      rarData] = await Promise.all([
      ruanganSnapshot,
      bangunanSnapshot,
      bendaSnapshot,
      rambuSnapshot,
      angkaSnapshot,
      rarSnapshot,
    ]);

    const responseData = {
      ruangan: [],
      bangunan: [],
      benda: [],
      rambu: [],
      angka: [],
      rar: [],
    };

    ruanganData.forEach((doc) => {
      const data = doc.data();
      responseData.ruangan.push(data);
    });

    bangunanData.forEach((doc) => {
      const data = doc.data();
      responseData.bangunan.push(data);
    });

    bendaData.forEach((doc) => {
      const data = doc.data();
      responseData.benda.push(data);
    });

    rambuData.forEach((doc) => {
      const data = doc.data();
      responseData.rambu.push(data);
    });

    angkaData.forEach((doc) => {
      const data = doc.data();
      responseData.angka.push(data);
    });

    rarData.forEach((doc) => {
      const data = doc.data();
      responseData.rar.push(data);
    });

    res.status(200).send({
      message: "Data koleksi kategori berhasil diambil",
      data: responseData,
      error: {},
    });
  } catch (error) {
    res.send({
      message: "Terjadi error",
      data: {},
      error: error,
    });
  }
});

// ================= RUANGAN ================= \\
// ================== POST DATA RUANGAN =================
app.post("/createRuangan", async (req, res) => {
  const form = new formidable.IncomingForm({multiples: true});

  try {
    form.parse(req, async (discnt, fields, files) => {
      const uuid = new UUID();
      const downloadPath =
        "https://firebasestorage.googleapis.com/v0/b/dbnaviku.appspot.com/o/";

      const qrImage = files.qrImage;
      const pdfFile = files.pdfFile;

      // url untuk gambar yang diunggah
      let imageUrl;
      let pdfUrl;

      const docID = ruanganRef.doc().id;

      if (discnt) {
        return res.status(400).json({
          message: "Terdapat error pada saat pengunggahan file",
          data: {},
          error: discnt,
        });
      }
      const bucket = storage.bucket("gs://dbnaviku.appspot.com");

      if (qrImage.size & pdfFile.size == 0) {
        //  tida ada yang dikerjakan
      } else {
        const imageRespons = await bucket.upload(qrImage.path, {
          destination: `kategori/ruangan/${qrImage.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        const pdfRespons = await bucket.upload(pdfFile.path, {
          destination: `kategori/ruangan/${pdfFile.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        // url gambar qr
        imageUrl =
          downloadPath +
          encodeURIComponent(imageRespons[0].name) +
          "?alt=media&token=" +
          uuid;

        pdfUrl =
          downloadPath +
          encodeURIComponent(pdfRespons[0].name) +
          "?alt=media&token=" +
          uuid;
      }

      // objek untuk dikirim ke database
      const ruanganModel = {
        id: docID,
        name: fields.name,
        qrImage: qrImage.size == 0 ? "" : imageUrl,
        pdfFile: pdfFile.size == 0 ? "" : pdfUrl,
      };

      await ruanganRef
          .doc(docID)
          .set(ruanganModel, {merge: true})
          .then((value) => {
            // return respon ke pengguna
            res.status(200).send({
              message: "Data telah berhasil dimasukan",
              data: ruanganModel,
              error: {},
            });
          });
    });
  } catch (discnt) {
    res.send({
      message: "Terjadi error",
      data: {},
      error: discnt,
    });
  }
});

// ================== get all data ruangan =================
app.get("/ruangan", async (req, res, next) => {
  await ruanganRef.get().then((value) => {
    const data = value.docs.map((doc) => doc.data());
    res.status(200).send({
      message: "Fetch All Ruangan",
      data: data,
    });
  });
});

// ================== get ruangan =================
app.get("/ruangan/:id", async (req, res, next) => {
  await ruanganRef
      .where("id", "==", req.params.id)
      .get()
      .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
          message: "Ruangan data",
          data: data,
        });
      });
});

// ================= BANGUNAN ================= \\
// ================== POST DATA BANGUNAN =================
app.post("/createBangunan", async (req, res) => {
  const form = new formidable.IncomingForm({multiples: true});

  try {
    form.parse(req, async (discnt, fields, files) => {
      const uuid = new UUID();
      const downloadPath =
        "https://firebasestorage.googleapis.com/v0/b/dbnaviku.appspot.com/o/";

      const qrImage = files.qrImage;
      const pdfFile = files.pdfFile;

      // url untuk gambar yang diunggah
      let imageUrl;
      let pdfUrl;

      const docID = bangunanRef.doc().id;

      if (discnt) {
        return res.status(400).json({
          message: "Terdapat error pada saat pengunggahan file",
          data: {},
          error: discnt,
        });
      }
      const bucket = storage.bucket("gs://dbnaviku.appspot.com");

      if (qrImage.size & pdfFile.size == 0) {
        //  tida ada yang dikerjakan
      } else {
        const imageRespons = await bucket.upload(qrImage.path, {
          destination: `kategori/bangunan/${qrImage.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        const pdfRespons = await bucket.upload(pdfFile.path, {
          destination: `kategori/bangunan/${pdfFile.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        // url gambar qr
        imageUrl =
          downloadPath +
          encodeURIComponent(imageRespons[0].name) +
          "?alt=media&token=" +
          uuid;

        pdfUrl =
          downloadPath +
          encodeURIComponent(pdfRespons[0].name) +
          "?alt=media&token=" +
          uuid;
      }

      // objek untuk dikirim ke database
      const bangunanModel = {
        id: docID,
        name: fields.name,
        qrImage: qrImage.size == 0 ? "" : imageUrl,
        pdfFile: pdfFile.size == 0 ? "" : pdfUrl,
      };

      await bangunanRef
          .doc(docID)
          .set(bangunanModel, {merge: true})
          .then((value) => {
            // return respon ke pengguna
            res.status(200).send({
              message: "Data telah berhasil dimasukan",
              data: bangunanModel,
              error: {},
            });
          });
    });
  } catch (discnt) {
    res.send({
      message: "Terjadi error",
      data: {},
      error: discnt,
    });
  }
});

// ================== get all data bangunan =================
app.get("/bangunan", async (req, res, next) => {
  await bangunanRef.get().then((value) => {
    const data = value.docs.map((doc) => doc.data());
    res.status(200).send({
      message: "Fetch All Bangunan",
      data: data,
    });
  });
});

// ================== get bangunan =================
app.get("/bangunan/:id", async (req, res, next) => {
  await bangunanRef
      .where("id", "==", req.params.id)
      .get()
      .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
          message: "Ruangan data ",
          data: data,
        });
      });
});

// ================= RAMBU ================= \\
// ================== POST DATA RAMBU =================
app.post("/createRambu", async (req, res) => {
  const form = new formidable.IncomingForm({multiples: true});

  try {
    form.parse(req, async (discnt, fields, files) => {
      const uuid = new UUID();
      const downloadPath =
        "https://firebasestorage.googleapis.com/v0/b/dbnaviku.appspot.com/o/";

      const qrImage = files.qrImage;
      const pdfFile = files.pdfFile;

      // url untuk gambar yang diunggah
      let imageUrl;
      let pdfUrl;

      const docID = rambuRef.doc().id;

      if (discnt) {
        return res.status(400).json({
          message: "Terdapat error pada saat pengunggahan file",
          data: {},
          error: discnt,
        });
      }
      const bucket = storage.bucket("gs://dbnaviku.appspot.com");

      if (qrImage.size & pdfFile.size == 0) {
        //  tida ada yang dikerjakan
      } else {
        const imageRespons = await bucket.upload(qrImage.path, {
          destination: `kategori/rambu/${qrImage.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        const pdfRespons = await bucket.upload(pdfFile.path, {
          destination: `kategori/rambu/${pdfFile.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        // url gambar qr
        imageUrl =
          downloadPath +
          encodeURIComponent(imageRespons[0].name) +
          "?alt=media&token=" +
          uuid;

        pdfUrl =
          downloadPath +
          encodeURIComponent(pdfRespons[0].name) +
          "?alt=media&token=" +
          uuid;
      }

      // objek untuk dikirim ke database
      const rambuModel = {
        id: docID,
        name: fields.name,
        qrImage: qrImage.size == 0 ? "" : imageUrl,
        pdfFile: pdfFile.size == 0 ? "" : pdfUrl,
      };

      await rambuRef
          .doc(docID)
          .set(rambuModel, {merge: true})
          .then((value) => {
            // return respon ke pengguna
            res.status(200).send({
              message: "Data telah berhasil dimasukan",
              data: rambuModel,
              error: {},
            });
          });
    });
  } catch (discnt) {
    res.send({
      message: "Terjadi error",
      data: {},
      error: discnt,
    });
  }
});

// ================== get all data rambu ==============
app.get("/rambu", async (req, res, next) => {
  await rambuRef.get().then((value) => {
    const data = value.docs.map((doc) => doc.data());
    res.status(200).send({
      message: "Fetch All Rambu",
      data: data,
    });
  });
});

// ================== get rambu =================
app.get("/rambu/:id", async (req, res, next) => {
  await rambuRef
      .where("id", "==", req.params.id)
      .get()
      .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
          message: "Ruangan data ",
          data: data,
        });
      });
});

// ================= BENDA ================= \\
// ================== POST DATA BENDA =================
app.post("/createBenda", async (req, res) => {
  const form = new formidable.IncomingForm({multiples: true});

  try {
    form.parse(req, async (discnt, fields, files) => {
      const uuid = new UUID();
      const downloadPath =
        "https://firebasestorage.googleapis.com/v0/b/dbnaviku.appspot.com/o/";

      const qrImage = files.qrImage;
      const pdfFile = files.pdfFile;

      // url untuk gambar yang diunggah
      let imageUrl;
      let pdfUrl;

      const docID = bendaRef.doc().id;

      if (discnt) {
        return res.status(400).json({
          message: "Terdapat error pada saat pengunggahan file",
          data: {},
          error: discnt,
        });
      }
      const bucket = storage.bucket("gs://dbnaviku.appspot.com");

      if (qrImage.size & pdfFile.size == 0) {
        // tida ada yang dikerjakan
      } else {
        const imageRespons = await bucket.upload(qrImage.path, {
          destination: `kategori/benda/${qrImage.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        const pdfRespons = await bucket.upload(pdfFile.path, {
          destination: `kategori/benda/${pdfFile.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        // url gambar qr
        imageUrl =
          downloadPath +
          encodeURIComponent(imageRespons[0].name) +
          "?alt=media&token=" +
          uuid;

        pdfUrl =
          downloadPath +
          encodeURIComponent(pdfRespons[0].name) +
          "?alt=media&token=" +
          uuid;
      }

      // objek untuk dikirim ke database
      const bendaModel = {
        id: docID,
        name: fields.name,
        qrImage: qrImage.size == 0 ? "" : imageUrl,
        pdfFile: pdfFile.size == 0 ? "" : pdfUrl,
      };

      await bendaRef
          .doc(docID)
          .set(bendaModel, {merge: true})
          .then((value) => {
            // return respon ke pengguna
            res.status(200).send({
              message: "Data telah berhasil dimasukan",
              data: bendaModel,
              error: {},
            });
          });
    });
  } catch (discnt) {
    res.send({
      message: "Terjadi error",
      data: {},
      error: discnt,
    });
  }
});

// ================== get all data benda =================
app.get("/benda", async (req, res, next) => {
  await bendaRef.get().then((value) => {
    const data = value.docs.map((doc) => doc.data());
    res.status(200).send({
      message: "Fetch All Benda",
      data: data,
    });
  });
});

// ================== get benda =================
app.get("/benda/:id", async (req, res, next) => {
  await bendaRef
      .where("id", "==", req.params.id)
      .get()
      .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
          message: "Data benda",
          data: data,
        });
      });
});

// ================= ANGKA ================= \\
// ================== POST DATA ANGKA =================
app.post("/createAngka", async (req, res) => {
  const form = new formidable.IncomingForm({multiples: true});

  try {
    form.parse(req, async (discnt, fields, files) => {
      const uuid = new UUID();
      const downloadPath =
        "https://firebasestorage.googleapis.com/v0/b/dbnaviku.appspot.com/o/";

      const qrImage = files.qrImage;
      const pdfFile = files.pdfFile;

      // url untuk gambar yang diunggah
      let imageUrl;
      let pdfUrl;

      const docID = angkaRef.doc().id;

      if (discnt) {
        return res.status(400).json({
          message: "Terdapat error pada saat pengunggahan file",
          data: {},
          error: discnt,
        });
      }
      const bucket = storage.bucket("gs://dbnaviku.appspot.com");

      if (qrImage.size & pdfFile.size == 0) {
        // tida ada yang dikerjakan
      } else {
        const imageRespons = await bucket.upload(qrImage.path, {
          destination: `kategori/angka/${qrImage.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        const pdfRespons = await bucket.upload(pdfFile.path, {
          destination: `kategori/angka/${pdfFile.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        // url gambar qr
        imageUrl =
          downloadPath +
          encodeURIComponent(imageRespons[0].name) +
          "?alt=media&token=" +
          uuid;

        pdfUrl =
          downloadPath +
          encodeURIComponent(pdfRespons[0].name) +
          "?alt=media&token=" +
          uuid;
      }

      // objek untuk dikirim ke database
      const angkaModel = {
        id: docID,
        name: fields.name,
        qrImage: qrImage.size == 0 ? "" : imageUrl,
        pdfFile: pdfFile.size == 0 ? "" : pdfUrl,
      };

      await angkaRef
          .doc(docID)
          .set(angkaModel, {merge: true})
          .then((value) => {
            // return respon ke pengguna
            res.status(200).send({
              message: "Data telah berhasil dimasukan",
              data: angkaModel,
              error: {},
            });
          });
    });
  } catch (discnt) {
    res.send({
      message: "Terjadi error",
      data: {},
      error: discnt,
    });
  }
});

// ================== get all data ANGKA =================
app.get("/angka", async (req, res, next) => {
  await angkaRef.get().then((value) => {
    const data = value.docs.map((doc) => doc.data());
    res.status(200).send({
      message: "Fetch All Benda",
      data: data,
    });
  });
});

// ================== get ANGKA =================
app.get("/angka/:id", async (req, res, next) => {
  await angkaRef
      .where("id", "==", req.params.id)
      .get()
      .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
          message: "Data benda",
          data: data,
        });
      });
});

// <><><><><><><><<> RAR FILE POST <><><><><><><><<> \\
// ================== post file rar SEMUA file =================
app.post("/createallCode", async (req, res) => {
  const form = new formidable.IncomingForm({multiples: true});

  try {
    form.parse(req, async (discnt, fields, files) => {
      const uuid = new UUID();
      const downloadPath =
        "https://firebasestorage.googleapis.com/v0/b/dbnaviku.appspot.com/o/";

      const rarFile = files.rarFile;

      // url untuk file rar yang diunggah
      let rarUrl;

      const docID = rarRef.doc().id;

      if (discnt) {
        return res.status(400).json({
          message: "Terdapat error pada saat pengunggahan file",
          data: {},
          error: discnt,
        });
      }
      const bucket = storage.bucket("gs://dbnaviku.appspot.com");

      if (rarFile == 0) {
        // tida ada yang dikerjakan
      } else {
        const rarRespons = await bucket.upload(rarFile.path, {
          destination: `kategori/rarfile/${rarFile.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        });

        // url gambar qr
        rarUrl =
          downloadPath +
          encodeURIComponent(rarRespons[0].name) +
          "?alt=media&token=" +
          uuid;
      }

      // objek untuk dikirim ke database
      const rarModel = {
        id: docID,
        name: fields.name,
        rarFile: rarFile.size == 0 ? "" : rarUrl,
      };

      await rarRef
          .doc(docID)
          .set(rarModel, {merge: true})
          .then((value) => {
            // return respon ke pengguna
            res.status(200).send({
              message: "Data telah berhasil dimasukan",
              data: rarModel,
              error: {},
            });
          });
    });
  } catch (discnt) {
    res.send({
      message: "Terjadi error",
      data: {},
      error: discnt,
    });
  }
});

// ================== get all data rar =================
app.get("/rar", async (req, res, next) => {
  await rarRef.get().then((value) => {
    const data = value.docs.map((doc) => doc.data());
    res.status(200).send({
      message: "Fetch All rar file",
      data: data,
    });
  });
});

// ================== get detail data rarfile =================
app.get("/rar/:id", async (req, res, next) => {
  await rarRef
      .where("id", "==", req.params.id)
      .get()
      .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
          message: "Data rar",
          data: data,
        });
      });
});

// export link endpoint
exports.api = functions.https.onRequest(app);
