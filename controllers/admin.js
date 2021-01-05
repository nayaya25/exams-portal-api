const superagent = require("superagent");
const { Validator } = require("node-input-validator");
const { SocketLabsClient } = require("@socketlabs/email");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const mime = require("mime-types");
const saltRounds = 10;
const client = new SocketLabsClient(
  parseInt(process.env.SOCKETLABS_SERVER_ID),
  process.env.SOCKETLABS_INJECTION_API_KEY
);
const fs = require("fs");
const path = require("path");
const ID = process.env.access_key_id;
const SECRET = process.env.secret_access_key;

const {
  DESK_API_KEY,
  DESK_API_SECRET,
  API_URL,
} = require("../helpers/constants");

const imageMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

const { Applicant, Admin } = require("../models");

//helper methods

const BUCKET_NAME = "nasims-admin-bucket";

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

const params = {
  Bucket: BUCKET_NAME,
  CreateBucketConfiguration: {
    // Set your region here
    LocationConstraint: "eu-west-1",
  },
};

s3.createBucket(params, function (err, data) {
  if (err && err.statusCode == 409) {
    console.log("Bucket has been created already");
  } else if (err) {
    console.log(err);
  } else {
    // console.log(data)

    console.log("Bucket Created Successfully", data);
  }
});

const saveFileInBucket = (params) => {
  return new Promise((resolve, reject) => {
    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        return reject(err);
      }
      // console.log(data)
      console.log(`File uploaded successfully. ${data.Location}`);
      return resolve(data);
    });
  });
};

const VerrorsMessageFormatter = (Verrors) => {
  //formats verror message
  let errors = Object.entries(Verrors);
  errorsFormatted = errors.map((h) => h[1].message);
  return errorsFormatted;
};

const passwordReset = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      email: "required|email",
    });
    const matched = await v.check();
    if (!matched) {
      return res.status(422).json({ error: VerrorsMessageFormatter(v.errors) });
    } else {
      let user = Admin.findOne({ where: { email: req.body.email } });

      if (user) {
        let activation_code = uuidv4();
        await Admin.update(
          { activationCode: activation_code },
          { where: { email: req.body.email } }
        );
        // const token = jwt.sign({ userId: user.id }, "secret" , { expiresIn: 3600 })
        const url =
          process.env.APP_URL + "/admin/newPassword/" + activation_code;
        const message = {
          to: req.body.email,
          from: "Nasims@example.com",
          subject: "NASIMS ADMIN Password Reset token",
          textBody: " Proceed to the website to reset your password and begin",
          htmlBody: "<a href='" + url + "'>" + url + "</a>",
          messageType: "basic",
        };
        await client.send(message).then(
          (res) => {
            console.log(res);
          },
          (err) => {
            console.log(err);
          }
        );
        return res.status(422).json({ activation_code });
      } else {
        return res.status(404).json(error);
      }
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

const newPassword = async (req, res) => {
  const password = req.body.password;
  const activation_code = req.params.activation_code;
  const email = req.body.email;
  console.log(activation_code);
  try {
    const hash = bcrypt.hashSync(password, saltRounds);
    let user = await Admin.findOne({ where: { email: email } });
    console.log(user);
    if (user) {
      const admin = await Admin.update(
        { password: hash, active: true, activation_code: null },
        { where: { email: email, activationCode: activation_code } }
      );
      console.log(admin);
      return res
        .status(200)
        .send({ message: "Password changed successfully!" });
    } else {
      return res.status(422).send({ message: "Admin doesnt exist" });
    }
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ message: "Something went wrong", err });
    }

    return res.status(400).send({ message: "Something went wrong", err });
  }
};

const login = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      email: "required",
      password: "required",
    });

    const matched = await v.check();
    if (!matched) {
      return res
        .status(422)
        .json({ message: VerrorsMessageFormatter(v.errors) });
    } else {
      const user = await Admin.findOne({ where: { email: req.body.email } });

      if (!user) return res.status(422).json({ error: "Admin doesn't exist" });

      if (!user.active)
        return res
          .status(422)
          .json({ error: "User account has not been activated" });

      const match = await bcrypt.compare(req.body.password, user.password);

      if (!match) return res.status(422).json({ error: "incorrect password" });

      const token = await jwt.sign(
        { data: user },
        "5b2f47da43492548593a2d0ecdc52f58"
      );

      return res.status(200).json({ userToken: token, admin: user });
    }
  } catch (error) {
    return res
      .status(422)
      .json({ message: "Auth failed check password or email" });
  }
};

const retakeTest = async (req, res) => {
  try {
    const v = new Validator({
      applicants: "required|array",
      "applicants.*.nasimsId:": "required",
    });
    const matched = await v.check();
    if (!matched) {
      return res.status(422).json({ error: VerrorsMessageFormatter(v.errors) });
    } else {
      for (obj in req.body.applicants) {
        const findApplicant = await Applicant.findOne({
          where: { nasimsId: obj.nasimsId },
        });
        if (!findApplicant) {
          return reject({ message: "Applicant not found" });
        } else {
          const applicant = await Applicant.update(
            { questions: null, score: null, attempts: null },
            { where: { email: email, activationCode: activation_code } }
          );
          console.log(applicant);
          return res
            .status(200)
            .send({ message: "Applicant can retake the exam now!" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(422).json({ error: error });
  }
};

const ApplicantScores = async (req, res) => {
  const applicants = await Applicant.findAll({});

  console.log(applicants);
  return res.status(200).send({ Applicants: applicants });
};

const newAdmin = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      firstName: "required",
      lastName: "required",
      email: "required|email",
      phoneNumber: "required",
    });

    const matched = await v.check();

    if (!matched) {
      return res.status(422).json({ error: VerrorsMessageFormatter(v.errors) });
    } else {
      let profileImage = "";
      if (req.files) {
        if (req.files.length > 1)
          return res
            .status(422)
            .json({ message: "Please Upload only one Picture" });
        let file = req.files.profileImage;

        if (!imageMimeTypes.includes(file.mimetype))
          return res.status(422).json({
            message: "Only PNG, JPG, JPEG, GIF files are allowed",
            mimeGiven: file.mimetype,
          });

        let extension = path.extname(file.name);
        let filename = uuidv4() + extension;
        req.body.file_extension = extension.replace(".", "");
        req.body.file_type = file.mimetype;
        req.body.filename = path.parse(file.name).name;
        req.body.file_size = file.size;
        // Setting up S3 upload parameters
        const params = {
          Bucket: BUCKET_NAME,
          Key: filename, // File name you want to save as in S3
          Body: file.data,
          ContentEncoding: "base64",
          ContentType: file.mimetype,
          ACL: "public-read",
        };
        const result = await saveFileInBucket(params);
        profileImage = result.Location;
      }

      const isAdmin = await Admin.findOne({ where: { email: req.body.email } });
      if (isAdmin) {
        return res.status(422).json({ message: "Admin already exists" });
      } else {
        req.body.profileImage = profileImage;
        const admin = new Admin(req.body);
        await admin.save();

        const message = {
          to: req.body.email,
          from: "nasims@example.com",
          subject: "NASIMS ADMIN",
          textBody:
            "An admin account has been created for you on Nasims dashboard proceed to the website to reset your password and activate your account",

          messageType: "basic",
        };

        await client.send(message).then(
          (res) => {
            console.log(res);
          },
          (err) => {
            console.log(err);
          }
        );

        return res.status(422).json({ message: "Admin succesfully created" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(422).json({ error: error });
  }
};

module.exports = {
  newAdmin,
  login,
  passwordReset,
  newPassword,
  retakeTest,
  ApplicantScores,
};
