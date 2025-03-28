import React, { useEffect, useState } from 'react';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

const ChatRoom = () => {
    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab, setTab] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: ''
    });

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId') || "Guest";
        setUserData((prevData) => ({ ...prevData, username: storedUserId }));
    }, []);

    useEffect(() => {
        console.log("User Data:", userData);
    }, [userData]);

    const connect = () => {
        const Sock = new SockJS('http://localhost:8081/ws');
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    };

    const onConnected = () => {
        setUserData({ ...userData, connected: true });
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
        userJoin();
    };

    const userJoin = () => {
        const chatMessage = {
            senderName: userData.username,
            status: "JOIN"
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    };

    const onMessageReceived = (payload) => {
        const payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                setPublicChats((prevChats) => [...prevChats, payloadData]);
                break;
            default:
                break;
        }
    };

    const onPrivateMessage = (payload) => {
        const payloadData = JSON.parse(payload.body);
        if (privateChats.get(payloadData.senderName)) {
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            const list = [payloadData];
            privateChats.set(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    };

    const onError = (err) => {
        console.error("Error:", err);
    };

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, message: value });
    };

    const sendValue = () => {
        if (stompClient) {
            const chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: "MESSAGE"
            };
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, message: "" });
        }
    };

    const sendPrivateValue = () => {
        if (stompClient) {
            const chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                message: userData.message,
                status: "MESSAGE"
            };

            if (userData.username !== tab) {
                privateChats.get(tab)?.push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, message: "" });
        }
    };

    const handleUsername = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, username: value });
    };

    const registerUser = () => {
        connect();
    };

    return (
        <div className="w-full h-screen flex flex-col items-center bg-gray-100">
            {userData.connected ? (
                <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg flex flex-col h-full">
                    <div className="flex flex-row justify-between items-center p-4 bg-blue-600 text-white">
                        <div className="text-xl font-semibold">Chat Room</div>
                        <button className="bg-red-600 px-4 py-2 rounded" onClick={() => setUserData({ ...userData, connected: false })}>Logout</button>
                    </div>

                    <div className="flex flex-row h-full">
                        <div className="w-1/4 bg-gray-200 p-4 overflow-auto">
                            <ul>
                                <li
                                    onClick={() => { setTab("CHATROOM"); }}
                                    className={`p-2 cursor-pointer ${tab === "CHATROOM" ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                                >
                                    Chatroom
                                </li>
                                {[...privateChats.keys()].map((name, index) => (
                                    <li
                                        onClick={() => { setTab(name); }}
                                        className={`p-2 cursor-pointer ${tab === name ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                                        key={index}
                                    >
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="w-3/4 bg-gray-50 p-4 flex flex-col justify-between h-full">
                            <ul className="flex-1 overflow-auto">
                                {(tab === "CHATROOM" ? publicChats : privateChats.get(tab) || []).map((chat, index) => (
                                    <li
                                        className={`my-2 p-2 rounded-lg ${chat.senderName === userData.username ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 text-gray-800'}`}
                                        key={index}
                                    >
                                        <div className="font-semibold">{chat.senderName}</div>
                                        <div>{chat.message}</div>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-center p-2">
                                <input
                                    type="text"
                                    className="w-full p-2 rounded-lg border border-gray-300"
                                    placeholder="Enter the message"
                                    value={userData.message}
                                    onChange={handleMessage}
                                />
                                <button
                                    type="button"
                                    className="ml-2 p-2 bg-blue-600 text-white rounded-lg"
                                    onClick={tab === "CHATROOM" ? sendValue : sendPrivateValue}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center w-full h-screen">
                    <input
                        id="user-name"
                        placeholder="Enter your name"
                        name="userName"
                        value={userData.username}
                        onChange={handleUsername}
                        className="p-2 border border-gray-300 rounded mb-4"
                    />
                    <button
                        type="button"
                        onClick={registerUser}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Connect
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatRoom;
