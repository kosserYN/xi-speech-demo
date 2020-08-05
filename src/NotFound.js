import React from "react"

function Notfound() {
    return (
        <div
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            }}
        >
            <h1 style={{position: "absolute", left: "50%", top: "50%", transform:"translate(-50%, -50%)", margin: 0, padding: 0}}>
                什么都没找到啊T T
            </h1>
            <img src="error.png" style={{position: "absolute", bottom: 0, right: 0}} alt="出错了"/>
        </div>
    )
}

export default Notfound;