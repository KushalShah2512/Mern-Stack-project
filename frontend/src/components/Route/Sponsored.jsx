import React from "react";
import styles from "../../styles/styles";

const Sponsored = () => {
    return (
        <div
            className={`${styles.section} hidden sm:block bg-white py-10 px-5 mb-12 cursor-pointer rounded-xl`}
        >
            <div className="flex justify-between w-full">
                <div className="flex items-start">
                    <img
                        src="https://cdn.logojoy.com/wp-content/uploads/2018/05/30143404/48-768x591.png"
                        alt=""
                        style={{ width: "150px", objectFit: "contain" }}
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="https://bcassetcdn.com/public/blog/wp-content/uploads/2021/11/10190900/Gucci.png"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt=""
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="https://bcassetcdn.com/public/blog/wp-content/uploads/2021/11/10190851/Louis-Vuitton-1.png"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt=""
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSxPi6FJDaOOQgNwTzj4vV0MIxpLWT7o8QEA&s"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt=""
                    />
                </div>
                <div className="flex items-start">
                    <img
                        src="https://cdn.logojoy.com/wp-content/uploads/2018/05/30143428/129.png"
                        style={{ width: "150px", objectFit: "contain" }}
                        alt=""
                    />
                </div>
            </div>
        </div>
    );
};

export default Sponsored;