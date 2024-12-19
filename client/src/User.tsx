import { useMutation, useQuery } from "@tanstack/react-query";
import * as tmImage from "@teachablemachine/image";
import { App, Button } from "antd";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import userImg from "./img.png";

interface UserCheckIn {
    userId: string;
    probability: number;
    time: string;
}

interface User {
    userId: string;
    name: string;
    gender: boolean;
    dob: string;
    address: string;
}

const getCurrentDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0, cần +1
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const User = () => {
    const { notification } = App.useApp();
    const URL = "https://teachablemachine.withgoogle.com/models/9Ikdn-5Se/";
    const [predictions, setPredictions] = useState<UserCheckIn[]>([]);
    const [isCheckin, setIsCheckin] = useState<boolean>(false);
    const [isCheckout, setIsCheckout] = useState<boolean>(false);
    const [isNotified, setIsNotified] = useState<boolean>(false); // Trạng thái thông báo

    const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
    const webcamRef = useRef<tmImage.Webcam | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const queryUsers = useQuery({
        queryKey: ["GET", "users"],
        queryFn: async () => axios.get("http://localhost:3000/get/user"),
        staleTime: Infinity,
    });

    const mutateCheckIn = useMutation({
        mutationKey: ["POST", "check-in"],
        mutationFn: async (data: any) =>
            axios.post("http://localhost:3000/post/check-in", data),
    });

    // console.log(queryUsers.data?.data);

    const init = async () => {
        try {
            if (webcamRef.current) {
                console.warn("Webcam is already initialized.");
                return;
            }

            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            // Load model từ Teachable Machine
            modelRef.current = await tmImage.load(modelURL, metadataURL);

            // Khởi tạo webcam
            const flip = true;
            const webcam = new tmImage.Webcam(450, 450, flip);
            await webcam.setup();
            await webcam.play();

            webcamRef.current = webcam;
            animationFrameRef.current = window.requestAnimationFrame(loop);
        } catch (error) {
            console.error("Error initializing model or webcam:", error);
        }
    };

    useEffect(() => {
        if (isCheckin || isCheckout) {
            init();
            return () => {
                if (webcamRef.current) {
                    webcamRef.current?.stop();
                    webcamRef.current = null;
                }
                if (animationFrameRef.current) {
                    window.cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            };
        }
    }, [isCheckin, isCheckout]);

    const loop = async () => {
        if (webcamRef.current) {
            webcamRef.current.update(); // Cập nhật webcam frame
            await predict();
            animationFrameRef.current = window.requestAnimationFrame(loop);
        }
    };

    const predict = async () => {
        try {
            if (webcamRef.current && modelRef.current) {
                const predictions = await modelRef.current.predict(
                    webcamRef.current.canvas
                );
                const formattedPredictions = predictions.map((pred) => ({
                    userId: pred.className,
                    probability: parseFloat(pred.probability.toFixed(2)),
                    time: getCurrentDateTime(),
                }));
                setPredictions(formattedPredictions);
            }
        } catch (error) {
            console.error("Error during prediction:", error);
        }
    };

    useEffect(() => {
        if (webcamRef.current && queryUsers.isSuccess) {
            const userCheckIn = predictions.find(
                (pred) => pred.probability >= 0.8
            );
            if (userCheckIn && !isNotified) {
                const userName = queryUsers.data.data.find(
                    (user: User) => user.userId === userCheckIn?.userId
                )?.name;
                setIsNotified(true);

                if (isCheckin) {
                    setTimeout(() => {
                        // Cleanup webcam
                        webcamRef.current?.stop();
                        webcamRef.current = null;
                        setPredictions([]);
                        setIsCheckin(false);
                        setIsNotified(false); // Reset trạng thái
                        notification.success({
                            message: "Check in thành công",
                            description: `Chúc ${userName} làm việc hiệu quả`,
                        });
                        mutateCheckIn.mutate({
                            ...userCheckIn,
                            isCheckIn: true,
                        });
                    }, 2000);
                } else if (isCheckout) {
                    setTimeout(() => {
                        // Cleanup webcam
                        webcamRef.current?.stop();
                        webcamRef.current = null;
                        setPredictions([]);
                        setIsCheckout(false);
                        setIsNotified(false); // Reset trạng thái
                        notification.success({
                            message: "Check out thành công",
                            description: `Tạm biệt ${userName}`,
                        });
                        mutateCheckIn.mutate({
                            ...userCheckIn,
                            isCheckIn: false,
                        });
                    }, 2000);
                }
            }
        }
    }, [predictions]);

    return (
        <div className="p-2">
            <h1 className="text-3xl text-center uppercase mb-10 font-bold">
                Chấm công
            </h1>

            <div className="flex gap-32 justify-center">
                <div id="webcam-container" className="w-[450px] h-[450px] ">
                    {!webcamRef.current && (
                        <img src={userImg} className="w-full h-full bg-white" />
                    )}
                    {webcamRef.current && (
                        <canvas
                            ref={(el) => {
                                if (webcamRef.current && el) {
                                    webcamRef.current.canvas = el;
                                }
                            }}
                            width={450}
                            height={450}
                            style={{
                                width: "450px",
                                height: "450px",
                            }}
                        />
                    )}
                </div>
                <div className="w-[200px] flex flex-col justify-center gap-4">
                    <Button
                        block
                        size="large"
                        type="primary"
                        onClick={() => setIsCheckin(true)}
                    >
                        Check in
                    </Button>
                    <Button
                        danger
                        size="large"
                        block
                        onClick={() => setIsCheckout(true)}
                    >
                        Check out
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default User;
