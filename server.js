const { PORT } = require("./helpers/constants");
const app = require("./loader");
const router = require("./routes");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser")
const cors = require("cors")

app.use(bodyParser.urlencoded({extended: false, limit: "10mb"}))
app.use(bodyParser.json({limit: "10mb"}))
app.use(cors())
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 5 * 1024 * 1024 * 1024 //5MB max file(s) size
    },
}))

app.use(router);

app.listen(PORT, () => {
    console.log(`Server Started at Port: ${PORT}`);
});
