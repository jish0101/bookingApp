require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = require("./configs/corsOptions");
const mongoose = require("mongoose");
const connectDB = require("./configs/dbConn");
const User = require("./models/User");
const Place = require("./models/Place");
const jwt = require("jsonwebtoken");
const Booking = require("./models/Booking.js");
const fs = require("fs");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const imageDownloader = require("image-downloader");
// const { deleteMany } = require("./models/User");
const PORT = process.env.PORT || 4000;

const bcryptSalt = bcrypt.genSaltSync(12);
const jwtSecret = "ioern343nk@#@3;kosmclmawds";

// connecting to DB;
connectDB();

app.use(cors(corsOptions));

app.use(express.json());

app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(cookieParser());

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

app.get("/test", (req, res) => {
  res.json("test");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const duplicate = await User.findOne({ email });
  if (duplicate) {
    res.send(422).json("user already exists");
    console.log(duplicate);
  }
  try {
    const securePassword = bcrypt.hashSync(password, bcryptSalt);
    const newUserDoc = await User.create({
      name,
      email,
      password: securePassword,
    });
    res.json(newUserDoc);
  } catch (err) {
    res.status(422).json(err);
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        {
          id: userDoc._id,
          name: userDoc.name,
          email: userDoc.email,
        },
        jwtSecret,
        {},
        (e, token) => {
          if (e) throw e;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.json("wrong pwsd");
    }
  } else {
    res.sendStatus(422).json("wrong credentials");
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await User.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: __dirname + "\\uploads\\" + newName,
  });
  res.json(newName);
});

const photosMiddleware = multer({ dest: "uploads/" });

app.post("/uploads", photosMiddleware.array("photos", 15), async (req, res) => {
  const files = req.files;
  const uploadedFiles = [];
  files.map((file) => {
    const { path, originalname } = file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace("uploads\\", ""));
  });
  res.json(uploadedFiles);
});

app.get("/places", async (req, res) => {
  res.json(await Place.find());
});

app.post("/places", (req, res) => {
  const {
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;

  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });
    res.json(placeDoc);
  });
});

app.get("/user-places", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      console.log(err);
      return;
    }
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
});

app.get("/places/:id", async (req, res) => {
  const { id } = req.params;
  res.json(await Place.findById(id));
});

app.put("/places", async (req, res) => {
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      res.json("error in saving form");
      throw err;
    }
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json("Successfully updated!");
    }
  });
});

app.post("/bookings", async (req, res) => {
  const userData = await getUserDataFromReq(req);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  Booking.create({
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/bookings", async (req, res) => {
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({ user: userData.id }).populate("place"));
});

mongoose.connection.once("open", () => {
  console.log("DB connection Open");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
