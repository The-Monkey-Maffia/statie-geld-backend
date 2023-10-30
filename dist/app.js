"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
app.get('/goededoelen/:naam/hea/:kaas', (req, res) => {
    console.log(req.params.kaas);
});
app.post('/goededoelen', () => {
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
