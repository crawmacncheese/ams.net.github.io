import React from "react";
// import Navbar from "./navbar";
import { useNavigate } from 'react-router-dom';
import logo from '../assets/img/0.jpg'
import "../css/bootstrap.min.css"

function Home() {

    const navigate = useNavigate();

    const homePage = () => {
        let path = '/';
        navigate(path);
    }




    return(
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">AMS-Net</a>
                    <a className="navbar-brand small-size" href="/">Home</a>
                    <a className="navbar-brand small-size" href="/demo">Labeling Tool</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="#" onClick={homePage}>Home</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

    <div className="container mt-4">
        <h1 >AMS-Net: Netlist Dataset for Analog/Mixed-Signal Circuits</h1>
        <p>AMS-Net is a dataset containing schematic diagrams and their corresponding netlists in SPICE format.</p>
        <p>Download is available at:</p>
        <ul>
            <li>GitHub project: <a href="https://github.com/AMS-Net/ams.net.github.io">https://github.com/AMS-Net/ams.net.github.io</a></li>
            {/* <li>Google Drive: <a href="https://drive.google.com/drive/folders/1Z9_lqXecMypJExzS03SCT8Ss8MAwATnV?usp=sharing">https://drive.google.com/drive/folders/1Z9_lqXecMypJExzS03SCT8Ss8MAwATnV?usp=sharing</a></li>
            <li>Baidu Drive: <a href="https://pan.baidu.com/s/1rq7UUGRp6BH8AIO8aWpLiA">https://pan.baidu.com/s/1rq7UUGRp6BH8AIO8aWpLiA</a> (password: iy1h)</li> */}
        </ul>
        <h3>Example</h3>
        <div className="row">
            <div className="col-6">
                <img src={logo} width="100%" />
            </div>
            <div className="col-6">
                <br/> *SPICE Netlist for circuit 0
                <br/> M1 7 2 6 0 NMOS W=1u L=1u
                <br/> M2 8 1 6 0 NMOS W=1u L=1u
                <br/> I1 6 0 DC 1mA
                <br/> M4 7 7 VDD VDD PMOS W=1u L=1u
                <br/> M3 8 7 VDD VDD PMOS W=1u L=1u
                <br/> C1 0 8 1nF
                <br/> .MODEL NMOS NMOS (LEVEL=1 VTO=1 KP=1.0e-4 LAMBDA=0.02)
                <br/> .MODEL PMOS PMOS (LEVEL=1 VTO=1 KP=1.0e-4 LAMBDA=0.02)
                <br/> .OP
                <br/> .END
            </div>
        </div>
    </div>
        </div>
    );
}

export default Home;
