// import { Button, Modal } from "antd";
// import { useState } from "react";
// import Admin from "./Admin";
// import User from "./User";

// const App: React.FC = () => {
//     const [open, setOpen] = useState<boolean>(true);
//     const [isUser, setIsUser] = useState<boolean>(false);
//     const [isAdmin, setIsAdmin] = useState<boolean>(false);

//     const handleOpenUserUI = () => {
//         setOpen(false);
//         setIsUser(true);
//     };
//     const handleOpenAdminUI = () => {
//         setOpen(false);
//         setIsAdmin(true);
//     };

//     return (
//         <>
//             <Modal
//                 title={
//                     <h1 className="uppercase text-center text-xl font-bold">
//                         Chấm công bằng khuôn mặt và RFID
//                     </h1>
//                 }
//                 centered
//                 open={open}
//                 footer={null}
//                 closeIcon={null}
//             >
//                 <Button
//                     type="primary"
//                     block
//                     className="mb-4 mt-4"
//                     size="large"
//                     onClick={handleOpenUserUI}
//                 >
//                     Chấm công
//                 </Button>
//                 <Button danger block size="large" onClick={handleOpenAdminUI}>
//                     Quản lý
//                 </Button>
//             </Modal>
//             {isUser && <User />}
//             {isAdmin && <Admin />}
//         </>
//     );
// };

// export default App;
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "http://172.168.2.188:3000"; // Thay bằng địa chỉ server của bạn

const App: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // Kết nối tới server
        const newSocket = io(SOCKET_SERVER_URL, {
            transports: ["websocket"], // Đảm bảo sử dụng WebSocket
        });

        setSocket(newSocket);

        // Xử lý khi kết nối thành công
        newSocket.on("connect", () => {
            console.log("Connected to server");
            setIsConnected(true);
        });

        // Xử lý khi ngắt kết nối
        newSocket.on("disconnect", () => {
            console.log("Disconnected from server");
            setIsConnected(false);
        });

        // Nhận thông báo từ server
        newSocket.on("message", (data: string) => {
            console.log("Message from server:", data);
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        // Xử lý khi có lỗi
        newSocket.on("connect_error", (error: any) => {
            console.error("Connection error:", error);
        });

        // Cleanup
        return () => {
            newSocket.close();
        };
    }, []);

    const sendMessage = () => {
        if (socket) {
            socket.emit("message", "Hello from React!");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Socket.IO React Test</h1>
            <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
            <button onClick={sendMessage} disabled={!isConnected}>
                Send Message
            </button>
            <h2>Messages:</h2>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
        </div>
    );
};

export default App;
