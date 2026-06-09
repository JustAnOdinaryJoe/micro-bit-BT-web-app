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
    document.getElementById("log").innerHTML +=
        msg + "<br>";
}

async function connect() {

    device =
    await navigator.bluetooth.requestDevice({
        filters: [
            { namePrefix: "BBC micro:bit" }
        ],
        optionalServices: [UART_SERVICE]
    });

    server = await device.gatt.connect();

    uartService =
    await server.getPrimaryService(UART_SERVICE);

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
        'characteristicvaluechanged',
        event => {

            const value =
            new TextDecoder().decode(
                event.target.value
            );

            log("Micro:bit: " + value);
        }
    );

    log("Connected!");
}

async function sendMessage() {

    const msg =
    document.getElementById("message").value;

    await txCharacteristic.writeValue(
        new TextEncoder().encode(msg)
    );

    log("You: " + msg);
}
