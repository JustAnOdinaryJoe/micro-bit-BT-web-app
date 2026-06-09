let device;
let server;
let uartService;
let txCharacteristic;
let rxCharacteristic;

const UART_SERVICE =
'6e400001-b5a3-f393-e0a9-e50e24dcca9e';

const TX_CHARACTERISTIC =
'6e400002-b5a3-f393-e0a9-e50e24dcca9e';

const RX_CHARACTERISTIC =
'6e400003-b5a3-f393-e0a9-e50e24dcca9e';

function log(msg) {
    const logDiv = document.getElementById("log");

    const line = document.createElement("div");
    line.textContent = msg;

    logDiv.appendChild(line);

    logDiv.scrollTop = logDiv.scrollHeight;
}

function setStatus(text) {
    document.getElementById("status").textContent = text;
}

async function connect() {

    try {

        setStatus("🟡 Connecting...");

        device =
        await navigator.bluetooth.requestDevice({
            filters: [
                { namePrefix: "BBC micro:bit" }
            ],
            optionalServices: [UART_SERVICE]
        });

        device.addEventListener(
            "gattserverdisconnected",
            () => {
                setStatus("🔴 Disconnected");
                log("Connection lost");
            }
        );

        server = await device.gatt.connect();

        uartService =
        await server.getPrimaryService(
            UART_SERVICE
        );

        txCharacteristic =
        await uartService.getCharacteristic(
            TX_CHARACTERISTIC
        );

        rxCharacteristic =
        await uartService.getCharacteristic(
            RX_CHARACTERISTIC
        );

        await rxCharacteristic.startNotifications();

        rxCharacteristic.addEventListener(
            "characteristicvaluechanged",
            event => {

                const value =
                new TextDecoder().decode(
                    event.target.value
                );

                log("🤖 " + value);
            }
        );

        setStatus("🟢 Connected");
        log("Connected to micro:bit");

    } catch(err) {

        console.error(err);

        setStatus("🔴 Failed");

        log("Error: " + err.message);
    }
}

async function sendMessage() {

    if (!txCharacteristic) {
        log("⚠ Not connected");
        return;
    }

    const input =
    document.getElementById("message");

    const msg = input.value.trim();

    if (!msg) return;

    try {

        await txCharacteristic.writeValue(
            new TextEncoder().encode(msg + "\n")
        );

        log("👤 " + msg);

        input.value = "";

    } catch(err) {

        log("Send failed: " + err.message);
    }
}

document
.getElementById("message")
.addEventListener("keydown", e => {

    if (e.key === "Enter") {
        sendMessage();
    }

});
