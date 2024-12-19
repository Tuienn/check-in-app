// #include <WiFi.h>
// #include <SocketIoClient.h>

// // Thông tin WiFi
// const char* ssid = "VnTrip-Tech1";
// const char* password = "Tech@6789";

// // Thông tin server
// const char* host = "172.168.2.188"; // Địa chỉ IP server
// const int port = 3000;              // Cổng server

// SocketIoClient socket;
// bool isConnected = false;  // Biến để theo dõi trạng thái kết nối

// void setup() {
//   Serial.begin(115200);
//   delay(1000);

//   Serial.println("Khởi động ESP32...");

//   // Kết nối WiFi
//   WiFi.begin(ssid, password);

//   Serial.print("Đang kết nối WiFi");
//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   }

//   Serial.println("\nWiFi đã kết nối!");
//   Serial.print("Địa chỉ IP của ESP: ");
//   Serial.println(WiFi.localIP());

//   // Kết nối WebSocket
//   socket.begin(host, port);

//   // Sự kiện kết nối thành công
//   socket.on("connect", [](const char* payload, size_t length) {
//     Serial.println("Đã kết nối tới server Socket.io!");
//     isConnected = true;
//     socket.emit("espMessage", "ESP32 đã kết nối thành công!");
//   });

//   // Sự kiện bị ngắt kết nối
//   socket.on("disconnect", [](const char* payload, size_t length) {
//     Serial.println("Đã ngắt kết nối với server!");
//     isConnected = false;
//   });

//   // Sự kiện lỗi kết nối
//   socket.on("connect_error", [](const char* payload, size_t length) {
//     Serial.println("Lỗi kết nối tới server!");
//     if (length > 0) {
//       Serial.print("Chi tiết lỗi: ");
//       Serial.write((const uint8_t*)payload, length);
//       Serial.println();
//     }
//   });

//   // Sự kiện nhận dữ liệu từ server
//   socket.on("serverMessage", [](const char* payload, size_t length) {
//     Serial.print("Nhận từ server: ");
//     Serial.write((const uint8_t*)payload, length);
//     Serial.println();
//   });
// }

// void loop() {
//   // Vòng lặp Socket.io
//   socket.loop();

//   // Kiểm tra trạng thái kết nối thông qua biến isConnected
//   if (isConnected) {
//     // Nếu kết nối thành công, gửi tin nhắn sau mỗi vài giây
//     static unsigned long lastSendTime = 0;
//     if (millis() - lastSendTime > 5000) {
//       socket.emit("espMessage", "Dữ liệu từ ESP32");
//       lastSendTime = millis();
//     }
//   } else {
//     // Nếu kết nối bị ngắt, thử kết nối lại
//     Serial.println("Đang thử kết nối lại...");
//     socket.begin(host, port);
//   }
// }
#include <WiFi.h>
#include <SocketIoClient.h>

const char* ssid = "VnTrip-Tech1";
const char* password = "Tech@6789";

// Thông tin server
const char* host = "172.168.2.188"; // Địa chỉ IP server
const int port = 3000;              // Cổng server

// const char* ssid = "Wokwi-GUEST";
// const char* password = "";

// const char* host = "192.168.2.26";
// const int port = 3000;

SocketIoClient socket;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Hello");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }

  socket.begin(host, port);
};

void loop (){
  socket.loop();
}

