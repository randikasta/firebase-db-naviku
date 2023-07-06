// menerapkan library nodeJS
const functions = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");
const UUID = require(("uuid-v4"));
const express = require("express");
const formidable = require("formidable-serverless");
require("dotenv").config();

// menggunakan library express
const app = express();
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

const admin = require('firebase-admin');

var serviceAccount = require("./serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// membuat variabel referensi pada table ruangan di firebase
const ruanganRef = admin.firestore().collection("ruangan");
const bangunanRef = admin.firestore().collection("bangunan");
const rambuRef = admin.firestore().collection("rambu");
const bendaRef = admin.firestore().collection("benda");
const angkaRef = admin.firestore().collection("angka");

// menyambungkan storage yang ada pada firebase
const storage = new Storage({
    keyFilename: "serviceAccount.json",
});

//route tes
app.get('/', (req, res) => {
    return res.status(200).send('HALLOO Kamu sudah terhubung')
});

// ruangan * 
// bangunan * 
// benda * 
// rambu * 
// angka *

//                   ==================================== RUANGAN ===================================                   \\
// ================== POST DATA RUANGAN =================
app.post('/createRuangan', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: true });
    
    try {
        form.parse(req, async (discnt, fields, files) => {
            let uuid = UUID();
            var downloadPath =
                "https://firebasestorage.googleapis.com/v0/b/gs://dbnaviku.appspot.com/o/"

        const qrImage = files.qrImage;
        const pdfFile = files.pdfFile;

        // url untuk gambar yang diunggah 
        let imageUrl;
        let pdfUrl;

        const docID = ruanganRef.doc().id;

        if(discnt) {
            return res.status(400).json({
                message: "Terdapat error pada saat pengunggahan file",
                data: {},
                error: discnt,
              });
        }
        const bucket = storage.bucket("gs://dbnaviku.appspot.com");

        if (qrImage.size & pdfFile.size == 0) {
            //  tida ada yang dikerjakan 
        } 
        else {
            const imageRespons = await bucket.upload(qrImage.path, {
                destination: `ruangan/${qrImage.name}`,
                resumable: true,
                metadata: {
                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                    },
                },
            });

            const pdfRespons = await bucket.upload(pdfFile.path, {
                destination: `ruangan/${pdfFile.name}`,
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
            .set(ruanganModel, { merge: true })
            .then((value) => {
                // return respon ke pengguna
                res.status(200).send({
                    message: "Data telah berhasil dimasukan",
                    data: ruanganModel,
                    error: {},
                });
            });
        });
    } 
    
    catch (discnt) {
        res.send({
            message: "Terjadi error",
            data: {},
            error: discnt
        });
    }
});


// ================== get all data ruangan =================
app.get('/ruangan', async (req, res, next) => {
    await ruanganRef.get().then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Fetch All Ruangan",
            data: data,
        });
    });
});

// ================== get ruangan ================= 
app.get('/ruangan/:id', async (req, res, next) => {
    await ruanganRef 
    .where("id", "==", req.params.id)
    .get()
    .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Ruangan data",
            data: data,
        })
    })
});



//                   ==================================== BANGUNAN ===================================                  \\
// ================== POST DATA BANGUNAN =================
app.post('/createBangunan', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: true });
    
    try {
        form.parse(req, async (discnt, fields, files) => {
            let uuid = UUID();
            var downloadPath =
                "https://firebasestorage.googleapis.com/v0/b/gs://dbnaviku.appspot.com/o/"

        const qrImage = files.qrImage;
        const pdfFile = files.pdfFile;

        // url untuk gambar yang diunggah 
        let imageUrl;
        let pdfUrl;

        const docID = bangunanRef.doc().id;

        if(discnt) {
            return res.status(400).json({
                message: "Terdapat error pada saat pengunggahan file",
                data: {},
                error: discnt,
              });
        }
        const bucket = storage.bucket("gs://dbnaviku.appspot.com")

        if (qrImage.size & pdfFile.size == 0) {
            //  tida ada yang dikerjakan 
        } 
        else {
            const imageRespons = await bucket.upload(qrImage.path, {
                destination: `bangunan/${qrImage.name}`,
                resumable: true,
                metadata: {
                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                    },
                },
            });

            const pdfRespons = await bucket.upload(pdfFile.path, {
                destination: `bangunan/${pdfFile.name}`,
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
            .set(bangunanModel, { merge: true })
            .then((value) => {
                // return respon ke pengguna
                res.status(200).send({
                    message: "Data telah berhasil dimasukan",
                    data: bangunanModel,
                    error: {},
                });
            });
        });
    } 
    
    catch (discnt) {
        res.send({
            message: "Terjadi error",
            data: {},
            error: discnt
        });
    }
});

// ================== get all data bangunan =================
app.get('/bangunan', async (req, res, next) => {
    await bangunanRef.get().then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Fetch All Bangunan",
            data: data,
        });
    });
});

// ================== get bangunan ================= 
app.get('/bangunan/:id', async (req, res, next) => {
    await bangunanRef 
    .where("id", "==", req.params.id)
    .get()
    .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Ruangan data ",
            data: data,
        })
    })
});



//                   ==================================== RAMBU ===================================                    \\
// ================== POST DATA RAMBU =================
app.post('/createRambu', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: true });
    
    try {
        form.parse(req, async (discnt, fields, files) => {
            let uuid = UUID();
            var downloadPath =
                "https://firebasestorage.googleapis.com/v0/b/gs://dbnaviku.appspot.com/o/"

        const qrImage = files.qrImage;
        const pdfFile = files.pdfFile;

        // url untuk gambar yang diunggah 
        let imageUrl;
        let pdfUrl;

        const docID = rambuRef.doc().id;

        if(discnt) {
            return res.status(400).json({
                message: "Terdapat error pada saat pengunggahan file",
                data: {},
                error: discnt,
              });
        }
        const bucket = storage.bucket("gs://dbnaviku.appspot.com")

        if (qrImage.size & pdfFile.size == 0) {
            //  tida ada yang dikerjakan 
        } 
        else {
            const imageRespons = await bucket.upload(qrImage.path, {
                destination: `rambu/${qrImage.name}`,
                resumable: true,
                metadata: {
                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                    },
                },
            });

            const pdfRespons = await bucket.upload(pdfFile.path, {
                destination: `rambu/${pdfFile.name}`,
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
            .set(rambuModel, { merge: true })
            .then((value) => {
                // return respon ke pengguna
                res.status(200).send({
                    message: "Data telah berhasil dimasukan",
                    data: rambuModel,
                    error: {},
                });
            });
        });
    } 
    
    catch (discnt) {
        res.send({
            message: "Terjadi error",
            data: {},
            error: discnt
        });
    }
});

// ================== get all data rambu ==============
app.get('/rambu', async (req, res, next) => {
    await rambuRef.get().then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Fetch All Rambu",
            data: data,
        });
    });
});

// ================== get rambu ================= 
app.get('/rambu/:id', async (req, res, next) => {
    await rambuRef 
    .where("id", "==", req.params.id)
    .get()
    .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Ruangan data ",
            data: data,
        })
    })
});



//                   ==================================== BENDA ===================================                   \\
// ================== POST DATA BENDA =================
app.post('/createBenda', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: true });

    try {
        form.parse(req, async (discnt, fields, files) => {
            let uuid = UUID();
            var downloadPath =
                "https://firebasestorage.googleapis.com/v0/b/gs://dbnaviku.appspot.com/o/"

        const qrImage = files.qrImage;
        const pdfFile = files.pdfFile;

        // url untuk gambar yang diunggah 
        let imageUrl;
        let pdfUrl;

        const docID = bendaRef.doc().id;

        if(discnt) {
            return res.status(400).json({
                message: "Terdapat error pada saat pengunggahan file",
                data: {},
                error: discnt,
              });
        }
        const bucket = storage.bucket("gs://dbnaviku.appspot.com")

        if (qrImage.size & pdfFile.size == 0) {
            //  tida ada yang dikerjakan 
        } 
        else {
            const imageRespons = await bucket.upload(qrImage.path, {
                destination: `benda/${qrImage.name}`,
                resumable: true,
                metadata: {
                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                    },
                },
            });

            const pdfRespons = await bucket.upload(pdfFile.path, {
                destination: `benda/${pdfFile.name}`,
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
            .set(bendaModel, { merge: true })
            .then((value) => {
                // return respon ke pengguna
                res.status(200).send({
                    message: "Data telah berhasil dimasukan",
                    data: bendaModel,
                    error: {},
                });
            });
        });
    } 
    
    catch (discnt) {
        res.send({
            message: "Terjadi error",
            data: {},
            error: discnt
        });
    }
});

// ================== get all data benda =================
app.get('/benda', async (req, res, next) => {
    await bendaRef.get().then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Fetch All Benda",
            data: data,
        });
    });
});

// ================== get benda ================= 
app.get('/benda/:id', async (req, res, next) => {
    await bendaRef 
    .where("id", "==", req.params.id)
    .get()
    .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Data benda",
            data: data ,
        })
    })
});


//                   ==================================== ANGKA ===================================                   \\
// ================== POST DATA ANGKA =================
app.post('/createAngka', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: true });

    try {
        form.parse(req, async (discnt, fields, files) => {
            let uuid = UUID();
            var downloadPath =
                "https://firebasestorage.googleapis.com/v0/b/gs://dbnaviku.appspot.com/o/"

        const qrImage = files.qrImage;
        const pdfFile = files.pdfFile;

        // url untuk gambar yang diunggah 
        let imageUrl;
        let pdfUrl;

        const docID = angkaRef.doc().id;

        if(discnt) {
            return res.status(400).json({
                message: "Terdapat error pada saat pengunggahan file",
                data: {},
                error: discnt,
              });
        }
        const bucket = storage.bucket("gs://dbnaviku.appspot.com")

        if (qrImage.size & pdfFile.size == 0) {
            //  tida ada yang dikerjakan 
        } 
        else {
            const imageRespons = await bucket.upload(qrImage.path, {
                destination: `angka/${qrImage.name}`,
                resumable: true,
                metadata: {
                    metadata: {
                        firebaseStorageDownloadTokens: uuid,
                    },
                },
            });

            const pdfRespons = await bucket.upload(pdfFile.path, {
                destination: `angka/${pdfFile.name}`,
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
            .set(angkaModel, { merge: true })
            .then((value) => {
                // return respon ke pengguna
                res.status(200).send({
                    message: "Data telah berhasil dimasukan",
                    data: angkaModel,
                    error: {},
                });
            });
        });
    } 

    catch (discnt) {
        res.send({
            message: "Terjadi error",
            data: {},
            error: discnt
        });
    }
});

// ================== get all data ANGKA =================
app.get('/angka', async (req, res, next) => {
    await angkaRef.get().then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Fetch All Benda",
            data: data,
        });
    });
});

// ================== get ANGKA ================= 
app.get('/angka/:id', async (req, res, next) => {
    await angkaRef 
    .where("id", "==", req.params.id)
    .get()
    .then((value) => {
        const data = value.docs.map((doc) => doc.data());
        res.status(200).send({
            message: "Data benda",
            data: data ,
        })
    })
});


// export link endpoint
exports.api = functions.https.onRequest(app);