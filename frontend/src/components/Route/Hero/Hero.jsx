import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";

const images = [
    "https://cdn4.singleinterface.com/files/enterprise/coverphoto/321578/Microsite-Banner-SPM-1-04-09-24-01-09-56.jpg",
    "https://gocoloop.com/uploads/brand/66554968-f0e4-4a83-806f-eff31c99f26f.jpg",
    "https://mir-s3-cdn-cf.behance.net/project_modules/1400/2b217d94833699.5e88dae100127.png",
    "https://zula.sg/wp-content/uploads/2023/05/levis-501-experience-pop-up-4.jpg"
];

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={`relative min-h-screen w-full bg-no-repeat bg-cover bg-center transition-all duration-1000 ${styles.noramlFlex}`}
            style={{
                backgroundImage: `url(${images[currentIndex]})`,
            }}
        >

        </div>
    );
};

export default Hero;
