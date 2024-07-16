import React, { useEffect, useRef, useState } from "react";
import one from '../assets/img/0.jpg';
import two from '../assets/img/2.jpg';
import three from '../assets/img/3.jpg';
import four from '../assets/img/4.jpg';
import five from '../assets/img/5.jpg';
const userUUID = generateUUID();

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// var stopboundingbox = false;

function Draw() {

    const [brush, setBrush] = useState(false);
    const [elements, setElements] = useState({});
    const [elements2, setElements2] = useState({});
    const [line, setLine] = useState([]);
    const [rect, setRect] = useState([]);
    const [drawing, setDrawing] = useState(false);
    const [coor, setCoor] = useState({x: 0, y: 0});
    const [labelel, setLabelel] = useState([]);
    const [coord, setCoord] = useState([]);
    const ctx = useRef(null);

    const [counter, setCounter] = useState(0);

    const [currentimg, setCurrentimg] = useState(0);
    const [imgcounter, setImgcounter] = useState(0);    

    const [circuitnames, setCircuitnames] = useState([]);
    const [hascircuitlist, setHascircuitlist] = useState(false);
    const [selectedcircuit, setSelectedcircuit] = useState("");



    const canvasRef = useRef(null);

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/instantiate_uuid?user_uuid=${userUUID}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        ctx.current = canvasRef.current.getContext("2d");
        ctx.current.strokeStyle = "red";
        ctx.current.fillStyle = "red";
    },[])
    
    // useEffect(() => {
    //     // const canvas = document.getElementById("mycanvas");
    //     ctx.current = canvasRef.current.getContext("2d");
    //     ctx.current.strokeStyle = "red";
    //     ctx.current.fillStyle = "red";
    //   }, []);
      
    const handleMouseDown = (e) => {
        setDrawing(true);
        var {clientX, clientY} = e;
        setCounter(counter + 1);
        const canvas = document.getElementById("mycanvas");
        var offset = canvas.getBoundingClientRect();
        if(brush) {
            setElements2({x12: clientX - (offset.left), y12:clientY - (offset.top)});
        } else {
            setElements({x1: clientX - (offset.left), y1:clientY - (offset.top)});
        }
        if(showcoor) {
            ctx.current.font = "15px Arial";
            ctx.current.fillText(`${clientX-offset.left}, ${clientY-offset.top}`,clientX-offset.left, clientY-offset.top);
        }
        var currentX = clientX-offset.left
        var currentY = clientY-offset.top
        if(isselect) {
            if(addglobal){
                Object.entries(bbox).forEach(([key,value]) => {
                [...value].forEach(rect => {
                    if(currentX > rect[1] && currentX < rect[3] && currentY > rect[0] && currentY < rect[2]) {
                        rect[4] = [selectedglobal];
                    } 
                    console.log(rect[4]);
                })
            })} else {
                Object.entries(bbox).forEach(([key,value]) => {
                    [...value].forEach(rect => {
                        if(currentX > rect[1] && currentX < rect[3] && currentY > rect[0] && currentY < rect[2]) {
                            rect[4] = [""];
                        } 
                        console.log(rect[4]);
                    })
                })
            }
        }
    }
    const handleMouseUp = (e) => {
        setDrawing(false);
        const canvas = document.getElementById("mycanvas");
        var offset = canvas.getBoundingClientRect();
        if(isselect) {
            if(showglobal) {
                ctx.current.clearRect(0,0,canvas.width,canvas.height);
                if(img) {
                    ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
                }
                [...rect].forEach(rect => {
                    ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
                });
                [...line].forEach(line => {
                    ctx.current.beginPath();
                    ctx.current.moveTo(line.x12,line.y12);
                    ctx.current.lineTo(line.x2,line.y2);
                    ctx.current.stroke();
                });
                if(showcoor) {
                    [...coord].forEach(coord => {
                        ctx.current.fillText(`${coord.x1}, ${coord.y1}`, coord.x1, coord.y1);
                        ctx.current.fillText(`${coord.x2}, ${coord.y2}`, coord.x2, coord.y2);
                    });
                }
                Object.entries(bbox).forEach(([key,value]) => {
                    [...value].forEach(rect => {
                        ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                        var rectX = (rect[1]+rect[3])/2;
                        ctx.current.font = "15px Arial";
                        ctx.current.fillText(rect[4],rectX,rect[0]);
                        ctx.current.fillText(key,rect[3],rect[2]);
                    })
                })
            }
            return;
        }
        if(brush) {
            setLine([...line, elements2]);
        } else {
            setRect([...rect, elements]);
        }
        if(brush) {
            var {x12,y12, x2, y2} = elements2;
            setCoord([...coord, {x1: x12, y1: y12, x2, y2}]);
            x12 += offset.left;
            x2 += offset.left;
            y12 += offset.top;
            y2 += offset.top;
            var xaxis = (x2+x12)/2;
            var yaxis = (y2+y12)/2;
        } else {
            var {x1,y1, x2: x2n, y2: y2n} = elements;
            setCoord([...coord, {x1, y1, x2: x2n, y2: y2n}]);
            x1 += offset.left;
            x2n += offset.left;
            y1 += offset.top;
            xaxis = (x2n+x1)/2;
            yaxis = y1
        }

        if(selectedLabel !== "" && islabel) {
            setLabelel([...labelel, {id: counter, value: selectedLabel, x: xaxis - offset.left, y: yaxis - offset.top}]);
            ctx.current.font = "15px Arial";
            ctx.current.fillText(selectedLabel,xaxis-offset.left,yaxis-offset.top);
        }

    }
    const handleMouseMove = (e) => {
        if(isselect) {
            return;
        }
        const canvas = document.getElementById("mycanvas");
        var offset = canvas.getBoundingClientRect();
        if(!drawing) {
            setCoor({x:e.clientX - offset.left, y: e.clientY - offset.top});
            return;
        }
        var {clientX,clientY} = e;
        setCoor({x:e.clientX - offset.left, y: e.clientY - offset.top});
        if(brush) {
            var {x12,y12} = elements2;
            const newel = {x12,y12,x2: clientX - (offset.left),y2: clientY - (offset.top), id: counter, label: selectedLabel};
            ctx.current.clearRect(0,0,canvas.width,canvas.height);
            setElements2(newel);
            if(img) {
                ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
            }
            [...line, newel].forEach(line => {
                ctx.current.beginPath();
                ctx.current.moveTo(line.x12,line.y12);
                ctx.current.lineTo(line.x2,line.y2);
                ctx.current.stroke();
            });
            [...rect].forEach(rect => {
                ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
            });
        } else {
            var {x1,y1} = elements;
            const newel = {x1,y1,x2: clientX - (offset.left),y2: clientY - (offset.top), id: counter, label: selectedLabel};
            ctx.current.clearRect(0,0,canvas.width,canvas.height);
            setElements(newel);
            if(img) {
                ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
            }
            [...rect, newel].forEach(rect => {
                ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
            });
            [...line].forEach(line => {
                ctx.current.beginPath();
                ctx.current.moveTo(line.x12,line.y12);
                ctx.current.lineTo(line.x2,line.y2);
                ctx.current.stroke();
            });
        }
        if(showcoor) {
            ctx.current.font = "15px Arial";
            ctx.current.fillText(`${clientX-offset.left}, ${clientY-offset.top}`,clientX-offset.left, clientY-offset.top);
            if(brush) {
                ctx.current.fillText(`${x12}, ${y12}`, x12, y12);
            } else {
                ctx.current.fillText(`${x1}, ${y1}`, x1, y1);
            }
            [...coord].forEach(coord => {
                ctx.current.fillText(`${coord.x1}, ${coord.y1}`, coord.x1, coord.y1);
                ctx.current.fillText(`${coord.x2}, ${coord.y2}`, coord.x2, coord.y2);
            })
        }
        [...labelel].forEach(label => {
            ctx.current.font = "15px Arial";
            ctx.current.fillText(label.value, label.x, label.y);
        })
        if(showall) {
            // console.log(bbox)
            Object.entries(bbox).forEach(([key,value]) => {
                [...value].forEach(rect => {
                    ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                    ctx.current.font = "15px Arial";
                    ctx.current.fillText(key,rect[3],rect[2]);
                    if(showlabel) {
                        ctx.current.fillText(rect[4][0],(rect[3]+rect[1])/2,rect[0]);
                    }   
                })
            })
        } else if(hidden) { 
            if(showall) {
                Object.entries(bbox).forEach(([key,value]) => {
                    if (key === imagelabel) return;
                    [...value].forEach(rect => {
                        ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                        ctx.current.font = "15px Arial";
                        ctx.current.fillText(key,rect[3],rect[2]);
                        if(showlabel) {
                            ctx.current.fillText(rect[4][0],(rect[3]+rect[1])/2,rect[0]);
                        }  
                    })
                })
            }
        } else if(highlightedel) {
            let highlighted = bbox[`${imagelabel}`];
            [...highlighted].forEach(rect => {
                ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                ctx.current.font = "15px Arial";
                ctx.current.fillText(imagelabel,rect[3],rect[2]);
                if(showlabel) {
                    ctx.current.fillText(rect[4][0],(rect[3]+rect[1])/2,rect[0]);
                }  
            })
        }

    }

    let [imgname, setImgname] = useState(null);

    let [img, setImg] = useState(null);
    const handleClick = (res) => {
        const canvas = document.getElementById("mycanvas");
        const outside = document.getElementById("outside");
        var file = res.target.files[0];
        setImgname(res.target.files[0].name);
        var img = new Image();
        img.onload = function() {
            outside.style.height = `${img.height}px`;
            outside.style.width = `${img.width}px`;
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.current.clearRect(0,0,canvas.width,canvas.height);
            ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
            setCounter(0);
            setRect([]);
            setLine([]);
            setLabelel([]);
            setCoord([]);
            setImg(img);
            const canvascont = document.getElementById("canvascontainer");
            canvascont.style.height = `${img.height}px`;
            canvascont.style.width = `${img.width}px`;
        }
        img.src = URL.createObjectURL(file);
        var formData = new FormData();
        formData.append('file', file);
        formData.append('counter', imgcounter);
        fetch(`http://127.0.0.1:5000/upload_and_replace?user_uuid=${userUUID}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            fetch(`http://127.0.0.1:5000/refresh_json?user_uuid=${userUUID}&imgname=${currentimg}`)
            .then(response => response.text())
            .then(data => {
                setCurrentimg(imgcounter);
                setImgcounter(imgcounter + 1);
                console.log(data);
            })
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    const remove = () => {
        const canvas = document.getElementById("mycanvas");
        setImg(null);
        ctx.current.clearRect(0,0,canvas.width,canvas.height);
        [...rect].forEach(rect => {
            ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
        });
        [...line].forEach(line => {
            ctx.current.beginPath();
            ctx.current.moveTo(line.x12,line.y12);
            ctx.current.lineTo(line.x2,line.y2);
            ctx.current.stroke();
        });
        if(showcoor) {
            [...coord].forEach(coord => {
                ctx.current.fillText(`${coord.x1}, ${coord.y1}`, coord.x1, coord.y1);
                ctx.current.fillText(`${coord.x2}, ${coord.y2}`, coord.x2, coord.y2);
            })
        }
        if(showlabel) {
            [...labelel].forEach(label => {
                ctx.current.font = "15px Arial";
                ctx.current.fillText(label.value, label.x, label.y);
            })
        }

    }

    const clearall = () => {
        const canvas = document.getElementById("mycanvas");
        ctx.current.clearRect(0,0,canvas.width,canvas.height);
        setRect([]);
        setLine([]);
        setCounter(0);
        setLabelel([]);
        setCoord([]);
        if(img) {
            ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
        }
        if(showall) {
            Object.entries(bbox).forEach(([key,value]) => {
                [...value].forEach(rect => {
                    ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                    ctx.current.font = "15px Arial";
                    ctx.current.fillText(key,rect[3],rect[2]);
                    if(showlabel) {
                        ctx.current.fillText(rect[4][0],(rect[3]+rect[1])/2,rect[0]);
                    }   
                })
            })
        } else if(hidden) { 
            if(showall) {
                Object.entries(bbox).forEach(([key,value]) => {
                    if (key === imagelabel) return;
                    [...value].forEach(rect => {
                        ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                        ctx.current.font = "15px Arial";
                        ctx.current.fillText(key,rect[3],rect[2]);
                        if(showlabel) {
                            ctx.current.fillText(rect[4][0],(rect[3]+rect[1])/2,rect[0]);
                        }  
                    })
                })
            }
        } else if(highlightedel) {
            let highlighted = bbox[`${imagelabel}`];
            [...highlighted].forEach(rect => {
                ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                ctx.current.font = "15px Arial";
                ctx.current.fillText(imagelabel,rect[3],rect[2]);
                if(showlabel) {
                    ctx.current.fillText(rect[4][0],(rect[3]+rect[1])/2,rect[0]);
                }  
            })
        }

    }

    const undo = () => {
        if(counter > 0) {
            const canvas = document.getElementById("mycanvas");
            if(line.length > 0 && rect.length > 0) {
                if((line[line.length -1].id > rect[rect.length -1].id)) {
                    line.pop();
                    setLine(line);
                    ctx.current.clearRect(0,0,canvas.width,canvas.height);
                    if(img) {
                        ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
                    }
                    [...rect].forEach(rect => {
                        ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
                    });
                    [...line].forEach(line => {
                        ctx.current.beginPath();
                        ctx.current.moveTo(line.x12,line.y12);
                        ctx.current.lineTo(line.x2,line.y2);
                        ctx.current.stroke();
                    });
                } else {
                    rect.pop();
                    setRect(rect);
                    ctx.current.clearRect(0,0,canvas.width,canvas.height);
                    if(img) {
                        ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
                    }
                    [...rect].forEach(rect => {
                        ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
                    });
                    [...line].forEach(line => {
                        ctx.current.beginPath();
                        ctx.current.moveTo(line.x12,line.y12);
                        ctx.current.lineTo(line.x2,line.y2);
                        ctx.current.stroke();
                    });
                }

            } else if(line.length > 0) {
                line.pop();
                    setLine(line);
                    ctx.current.clearRect(0,0,canvas.width,canvas.height);
                    if(img) {
                        ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
                    }
                    [...rect].forEach(rect => {
                        ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
                    });
                    [...line].forEach(line => {
                        ctx.current.beginPath();
                        ctx.current.moveTo(line.x12,line.y12);
                        ctx.current.lineTo(line.x2,line.y2);
                        ctx.current.stroke();
                    });
            } else if(rect.length > 0) {
                rect.pop();
                    setRect(rect);
                    ctx.current.clearRect(0,0,canvas.width,canvas.height);
                    if(img) {
                        ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
                    }
                    [...rect].forEach(rect => {
                        ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
                    });
                    [...line].forEach(line => {
                        ctx.current.beginPath();
                        ctx.current.moveTo(line.x12,line.y12);
                        ctx.current.lineTo(line.x2,line.y2);
                        ctx.current.stroke();
                    });
            }
            setCounter(counter - 1);
            var curlabel = labelel;
            curlabel.pop();
            setLabelel(curlabel);
            if(showlabel) {
                [...labelel].forEach(label => {
                    ctx.current.font = "15px Arial";
                    ctx.current.fillText(label.value, label.x, label.y);
                })
            }
            var coorcur = coord;
            coorcur.pop();
            setCoord(coorcur);
            if(showcoor) {
                [...coord].forEach(coord => {
                    ctx.current.fillText(`${coord.x1}, ${coord.y1}`, coord.x1, coord.y1);
                    ctx.current.fillText(`${coord.x2}, ${coord.y2}`, coord.x2, coord.y2);
                })
            }
            
        }
        if(showall) {
            Object.entries(bbox).forEach(([key,value]) => {
                [...value].forEach(rect => {
                    ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                    ctx.current.font = "15px Arial";
                    ctx.current.fillText(key,rect[3],rect[2]);
                    if(showlabel) {
                        ctx.current.fillText(rect[4][0],(rect[3]+rect[1])/2,rect[0]);
                    }   
                })
            })
        } else if(hidden) { 
            if(showall) {
                Object.entries(bbox).forEach(([key,value]) => {
                    if (key === imagelabel) return;
                    [...value].forEach(rect => {
                        ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                        ctx.current.font = "15px Arial";
                        ctx.current.fillText(key,rect[3],rect[2]);
                        if(showlabel) {
                            ctx.current.fillText(rect[4][0],(rect[3]+rect[1])/2,rect[0]);
                        }  
                    })
                })
            }
        } else if(highlightedel) {
            let highlighted = bbox[`${imagelabel}`];
            [...highlighted].forEach(rect => {
                ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                ctx.current.font = "15px Arial";
                ctx.current.fillText(imagelabel,rect[3],rect[2]);
                if(showlabel) {
                    ctx.current.fillText(rect[4][0],(rect[3]+rect[1])/2,rect[0]);
                }  
            })
        }
    }




    const download = () => {
        const canvas = document.getElementById("mycanvas");
        var link = document.createElement('a');
        link.download = 'download.png';
        link.href = canvas.toDataURL("image/png").replace("image/png","image/octet-stream");
        link.click();
    }

    const [showcoor, setShowcoor] = useState(false);
    const changecoor = () => {
        if(showcoor) {
            const canvas = document.getElementById("mycanvas");
            ctx.current.clearRect(0,0,canvas.width,canvas.height);
            if(img) {
                ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
            }
            [...rect].forEach(rect => {
                ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
            });
            [...line].forEach(line => {
                ctx.current.beginPath();
                ctx.current.moveTo(line.x12,line.y12);
                ctx.current.lineTo(line.x2,line.y2);
                ctx.current.stroke();
            });
            if(showlabel) {
                [...labelel].forEach(label => {
                    ctx.current.font = "15px Arial";
                    ctx.current.fillText(label.value, label.x, label.y);
                })
            }
        } else {
            [...coord].forEach(coord => {
                ctx.current.fillText(`${coord.x1}, ${coord.y1}`, coord.x1, coord.y1);
                ctx.current.fillText(`${coord.x2}, ${coord.y2}`, coord.x2, coord.y2);
            });
        }
        setShowcoor(!showcoor);
    }

    const [islabel, setIslabel] = useState(false);
    const [label, setLabel] = useState(false);
    const [labelcount, setLabelcount] = useState(0);

    const selectRef = useRef(null);

    const createlabel = () => {
        var newlabel = prompt("Enter label name: ");
        if(newlabel) {
            setLabel(newlabel);
            setLabelcount(labelcount + 1);
        }
    }

    useEffect(() => {
        if (label) {
            var opt = document.createElement('option');
            opt.id = label;
            opt.value = label;
            opt.innerHTML = label;
            // Use the ref instead of getElementById
            if (selectRef.current) {
                selectRef.current.appendChild(opt);
            }
        }
    }, [label]);

    const deletelabel = () => {
        if ((labelcount === 0) || selectedLabel === "") return;
        // var delete = prompt("")
        var selected = document.getElementById(selectedLabel);
        const select = document.getElementById("select");
        select.removeChild(selected);
        if(labelcount-1 === 0) {
            setLabel(false);
            setSelectedLabel("");
        }
        setLabelcount(labelcount - 1);
    }

    const [selectedLabel, setSelectedLabel] = useState("");

    const handleLabelChange = (e) => {
        if (e.target.value === selectedLabel) {
            setSelectedLabel("");
            setIslabel(!islabel);
        } else {
            setSelectedLabel(e.target.value);
            setIslabel(true);
            setIsselect(false);
        }
    }

    const [showlabel, setShowlabel] = useState(true);

    const changelabel = () => {
        if(showlabel) {
            const canvas = document.getElementById("mycanvas");
            ctx.current.clearRect(0,0,canvas.width,canvas.height);
            if(img) {
                ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
            }
            [...rect].forEach(rect => {
                ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
            });
            [...line].forEach(line => {
                ctx.current.beginPath();
                ctx.current.moveTo(line.x12,line.y12);
                ctx.current.lineTo(line.x2,line.y2);
                ctx.current.stroke();
            });
            if(showcoor) {
                [...coord].forEach(coord => {
                    ctx.current.fillText(`${coord.x1}, ${coord.y1}`, coord.x1, coord.y1);
                    ctx.current.fillText(`${coord.x2}, ${coord.y2}`, coord.x2, coord.y2);
                });
            }
            Object.entries(bbox).forEach(([key,value]) => {
                [...value].forEach(rect => {
                    ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                    var rectX = (rect[1]+rect[3])/2;
                    ctx.current.font = "15px Arial";
                    ctx.current.fillText(rect[4],rectX,rect[0]);
                    ctx.current.fillText(key,rect[3],rect[2]);
                })
            })

        } else {
            [...labelel].forEach(label => {
                ctx.current.font = "15px Arial";
                ctx.current.fillText(label.value, label.x, label.y);
            })
        } 
        setShowlabel(!showlabel);
    }

    const downloadjson = () => {

        var json = {
            "image": imgname,
            "line": line,
            "rectangle": rect,
            "coordinates": coord,
            "label": labelel
        }

        var blob = new Blob([JSON.stringify(json)], {type: "text/plain"});
        var link = document.createElement('a');
        link.download = 'export.JSON';
        link.href = URL.createObjectURL(blob);
        link.click();
    }

    const updateimg = (images) => {
        var formData = new FormData();
        var file = new File([images], "imageName.png");
        formData.append('file', file);
        fetch(`http://127.0.0.1:5000/upload_and_replace?user_uuid=${userUUID}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    const fetchdata = () => {
        var json = {
            "image": imgname,
            "line": line,
            "rectangle": rect,
            "coordinates": coord,
            "label": labelel
        }
        fetch(`http://127.0.0.1:5000/replace_json?user_uuid=${userUUID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(json),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        fetch(`http://127.0.0.1:5000/run_script?user_uuid=${userUUID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({counter: currentimg})
        })
        .then(response => response.blob())
        .then(
            images => {
            // let url = URL.createObjectURL(images);
            setShowall(false);
            const canvas = document.getElementById("mycanvas");
            ctx.current.clearRect(0,0,canvas.width,canvas.height);
            setRect([]);
            setLine([]);
            setCounter(0);
            setLabelel([]);
            setCoord([]);
            if(img) {
                ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
            }
            setBbox({});
            // var img = new Image();
            // img.onload = function() {
            //     outside.style.height = `${img.height}px`;
            //     outside.style.width = `${img.width}px`;
            //     canvas.height = img.height;
            //     canvas.width = img.width;
            //     ctx.current.clearRect(0,0,canvas.width,canvas.height);
            //     ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
            //     setCounter(0);
            //     setRect([]);
            //     setLine([]);
            //     setLabelel([]);
            //     setCoord([]);
            //     setImg(img);
            //     updateimg(images);
            // }
            // img.src = url;
            fetch(`http://127.0.0.1:5000/get_bbox?user_uuid=${userUUID}&imgname=${currentimg}`)
            .then(response => response.json())
            .then(
                bbox => {
                    setBbox(bbox);
                    console.log(bbox);
                    Object.entries(bbox).forEach(([key,value]) => {
                        [...value].forEach(rect => {
                            ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                            ctx.current.font = "15px Arial";
                            ctx.current.fillText(key,rect[3],rect[2]);
                        })
                    })
                    setShowall(true);
                    setHidden(false);
                    setHighlightedel(false); 
                }
            )
            fetch(`http://127.0.0.1:5000/get_img_labels?user_uuid=${userUUID}`)
            .then(response => response.json())
            .then(
                data => {
                    data.forEach((item,index) => {
                        data[index] = item.slice(0,-6);
                    })
                    setImagenames(data);
                    setHascomponent(true);

                }
            )
            fetch(`http://127.0.0.1:5000/get_all_img?user_uuid=${userUUID}`)
            .then(response => response.json())
            .then(data => {
                setCircuitnames(data);
                console.log(data);
                setHascircuitlist(true);
            })
        });
        
    }

    const [bbox, setBbox] = useState({});
    const [globallabel, setGloballabel] = useState("Untitled Diagram");
    const [hascomponent,setHascomponent] = useState(false);
    const [imagenames, setImagenames] = useState([]);

    const createname = (event) => { 
        console.log(event.target.innerHTML)
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents the addition of a new line in the contentEditable element
            event.target.blur();
            setGloballabel(event.target.innerHTML);
            if(globallabel == "") {
                setGloballabel("Untitled Diagram");
            }
          }

    }

    const [imagelabel, setImagelabel] = useState("");

    const handleimagelabel = (e) => { 
        setImagelabel(e.target.value);

    }

    const deleteimage = () => { 
        if(imagelabel === "") return;
        var name = `${imagelabel}_0.jpg`
        fetch(`http://127.0.0.1:5000/delete_img?user_uuid=${userUUID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: name, label: imagelabel, imgnumber:currentimg})
        })
        .then(response => response.json())
        .then(bbox => {
            setBbox(bbox);
            setImagenames(previmg => {
                const imagenames = previmg.filter(image => image != imagelabel)
                if (imagenames.length === 0) {
                    setHascomponent(false);
                }
                return imagenames;
            }
            );
            console.log(imagenames);

            // #MAKE THIS SO THAT THE ARRAY UPDATES
            const canvas = document.getElementById("mycanvas");
            ctx.current.clearRect(0,0,canvas.width,canvas.height);
            if(img) {
                ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
            }
            [...rect].forEach(rect => {
                ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
            });
            if(showall || hidden) {
                Object.entries(bbox).forEach(([key,value]) => {
                    if (key === imagelabel) return;
                    [...value].forEach(rect => {
                        ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                        ctx.current.font = "15px Arial";
                        ctx.current.fillText(key,rect[3],rect[2]);
                    })
                })
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    const [highlightedel, setHighlightedel] = useState(false);
    const [hidden, setHidden] = useState(false);


    const displayhighlight = () => {
        const canvas = document.getElementById("mycanvas");
        ctx.current.clearRect(0,0,canvas.width,canvas.height);
        if(img) {
            ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
        }
        [...rect].forEach(rect => {
            ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
        });
        [...labelel].forEach(label => {
            ctx.current.font = "15px Arial";
            ctx.current.fillText(label.value, label.x, label.y);
        })
        
        let highlighted = bbox[`${imagelabel}`];
        [...highlighted].forEach(rect => {
            ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
            ctx.current.font = "15px Arial";
            var rectX = (rect[1]+rect[3])/2;
            ctx.current.fillText(rect[4],rectX,rect[0]);
            ctx.current.fillText(imagelabel,rect[3],rect[2]);
        })
        setShowall(false);
        setHighlightedel(true);
        setHidden(false);
    }

    const hidehighlight = () => { 
        const canvas = document.getElementById("mycanvas");
        ctx.current.clearRect(0,0,canvas.width,canvas.height);
        if(img) {
            ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
        }
        [...rect].forEach(rect => {
            ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
        });
        [...labelel].forEach(label => {
            ctx.current.font = "15px Arial";
            ctx.current.fillText(label.value, label.x, label.y);
        })
        if(showall) {
            Object.entries(bbox).forEach(([key,value]) => {
                if (key === imagelabel) return;
                [...value].forEach(rect => {
                    ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                    ctx.current.font = "15px Arial";
                    var rectX = (rect[1]+rect[3])/2;
                    ctx.current.fillText(rect[4],rectX,rect[0]);
                    ctx.current.fillText(key,rect[3],rect[2]);
                })
            })
        }
        setHidden(true);
        setShowall(false);
        setHighlightedel(false);
    }

    const [showall,setShowall] = useState(true);

    const toggleall = () => {

        const canvas = document.getElementById("mycanvas");
        ctx.current.clearRect(0,0,canvas.width,canvas.height);
        if(img) {
            ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
        }
        [...rect].forEach(rect => {
            ctx.current.strokeRect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2-rect.y1);
        });
        [...labelel].forEach(label => {
            ctx.current.font = "15px Arial";
            ctx.current.fillText(label.value, label.x, label.y);
        })
        if(!showall) {
            Object.entries(bbox).forEach(([key,value]) => {
                [...value].forEach(rect => {
                    ctx.current.strokeRect(rect[1],rect[0],rect[3]-rect[1],rect[2]-rect[0]);
                    ctx.current.font = "15px Arial";
                    var rectX = (rect[1]+rect[3])/2;
                    ctx.current.fillText(rect[4],rectX,rect[0]);
                    ctx.current.fillText(key,rect[3],rect[2]);
                })
            })
        }
        setShowall(!showall);
        setHidden(false);
        setHighlightedel(false);  
    }

    const selectglobalRef = useRef(null);

    const [showglobal, setShowglobal] = useState(true);
    const [isselect, setIsselect] = useState(false);
    const [globalselect, setGlobalselect] = useState(false);
    const [globalselectcount,setGlobalselectcount] = useState(0);
    const [selectedglobal, setSelectedglobal] = useState(false);
    const [addglobal, setAddglobal] = useState(true);

    const toggleGloballabel = () => {
        setShowglobal(!showglobal);
     }

    const createglobal = () => {
        var newlabel = prompt("Enter label name: ");
        if(newlabel) {
            setGlobalselect(newlabel);
            setGlobalselectcount(labelcount + 1);
        }
    }

    useEffect(() => {
        if (globalselect) {
            var opt = document.createElement('option');
            opt.id = globalselect;
            opt.value = globalselect;
            opt.innerHTML = globalselect;
            // Use the ref instead of getElementById
            if (selectglobalRef.current) {
                selectglobalRef.current.appendChild(opt);
            }
        }
    }, [globalselect]);

    const selectglobalref = useRef(null);

    // useEffect(() => {
    //     if(imagelabel) {
    //         var opt = document.createElement('option');
    //         opt.id = globalselect;
    //         opt.value = globalselect;
    //         opt.innerHTML = globalselect;
    //         // Use the ref instead of getElementById
    //         if (selectglobalRef.current) {
    //             selectglobalRef.current.appendChild(opt);
    //         }
    //     }

    const deleteglobal = () => {
        if ((globalselectcount === 0) || selectedglobal === "") return;
        // var delete = prompt("")
        var selected = document.getElementById(selectedglobal);
        const select = document.getElementById("selectglobal");
        select.removeChild(selected);
        if(globalselectcount-1 === 0) {
            setGlobalselect(false);
            setSelectedglobal("");
        }
        setGlobalselectcount(globalselectcount - 1);
    }

    

    const handleglobalchange = (e) => {
        setSelectedglobal(e.target.value);
        setIsselect(true);
        setIslabel(false);
    }

    const getnetlist = () => {
        fetch(`http://127.0.0.1:5000/get_netlist?user_uuid=${userUUID}&imgnumber=${currentimg}`)
        .then(response => response.json())
        .then(data => 
            {
                const blob = new Blob([data.file_content], {type: 'text/plain'});
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'netlist.txt');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
    }

    const toggleaddglobal = () => {
        setAddglobal(!addglobal);
        
     }

    const [dropdown, setDropdown] = useState(false);    

    const triggerdropdown = () => {
        setDropdown(!dropdown);
    }

    const handlecircuit = (e) => {
        setDropdown(false);
        var name = e.target.getAttribute('value');
        const imageMapping = {
            'sample_1': one,
            'sample_2': two,
            'sample_3': three,
            'sample_4': four,
            'sample_5': five
        };

        var imgpath = imageMapping[name]
        console.log(imgpath);
        const canvas = document.getElementById("mycanvas");
        const outside = document.getElementById("outside");
        setImgname(name);
        var img = new Image();
        img.onerror = function() {
            console.error("Error loading image:", img.src);
        };
        img.onload = function() {
            outside.style.height = `${img.height}px`;
            outside.style.width = `${img.width}px`;
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.current.clearRect(0,0,canvas.width,canvas.height);
            ctx.current.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
            setCounter(0);
            setRect([]);
            setLine([]);
            setLabelel([]);
            setCoord([]);
            setImg(img);
            const canvascont = document.getElementById("canvascontainer");
            canvascont.style.height = `${img.height}px`;
            canvascont.style.width = `${img.width}px`;
        }
        img.src = imgpath;
        fetch(imgpath)
        .then(response => response.blob())
        .then(blob => {
            var formData = new FormData();
            formData.append('file', blob);
            formData.append('counter', imgcounter);
            fetch(`http://127.0.1:5000/upload_and_replace?user_uuid=${userUUID}`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                fetch(`http://127.0.0.1:5000/refresh_json?user_uuid=${userUUID}&imgname=${currentimg}`)
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    setCurrentimg(imgcounter);
                    setImgcounter(imgcounter + 1);
                })
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        })

    }

    const handlediagram = (e) => {
        var selectedimg = ""
        var selected = e.target.value;
        if(selected == "0") {
            selectedimg = `${currentimg}`
        } else if(selected == "0_cpnt") {
            selectedimg = `${currentimg}_cpnt`
        } else if(selected == "0_net") {
            selectedimg = `${currentimg}_net`
        }
        console.log(currentimg,selectedimg)
        fetch(`http://127.0.0.1:5000/get_img?user_uuid=${userUUID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({imgname: currentimg, imgtype: selectedimg})
        }  
        )
        .then(response => response.blob())
        .then(img => {
            let url = URL.createObjectURL(img);
            var image = new Image();
            const canvas = document.getElementById("mycanvas");
            const outside = document.getElementById("outside");
            image.onload = function() {
                outside.style.height = `${image.height}px`;
                outside.style.width = `${image.width}px`;
                canvas.height = image.height;
                canvas.width = image.width;
                ctx.current.clearRect(0,0,canvas.width,canvas.height);
                ctx.current.drawImage(image,0,0,image.width,image.height,0,0,image.width,image.height);
                setCounter(0);
                setRect([]);
                setLine([]);
                setLabelel([]);
                setCoord([]);
                setImg(image);
            }
            image.src = url;
            image.onerror = function() {
                console.error("Error loading image:", url);
            };
        })
    }




    const deletecircuit = () => {
        var imgname = selectedcircuit;
        var imgpngname = `${imgname}.png`;
        console.log(imgpngname);
        fetch(`http://127.0.0.1:5000/delete_circuit?user_uuid=${userUUID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: imgname})
            })
        .then(response => response.json())
        .then(data => { 
            console.log(data);
            setSelectedcircuit("")
            setCircuitnames(prevCircuit => {

                const newcircuit = prevCircuit.filter(circuit => circuit != imgpngname);
                if (newcircuit.length === 0) {
                    setHascircuitlist(false);
                }
                return newcircuit;
            }
            )
        })

    }

    const handlecircuitlabel = (e) => {
        setSelectedcircuit(e.target.value);
    }

    const displaycircuit = () => {
        fetch(`http://127.0.0.1:5000/get_img?user_uuid=${userUUID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({imgname: selectedcircuit, imgtype: selectedcircuit})
        }  
        )
        .then(response => response.blob())
        .then(img => {
            setCurrentimg(selectedcircuit);
            let url = URL.createObjectURL(img);
            clearall();
            var image = new Image();
            const canvas = document.getElementById("mycanvas");
            const outside = document.getElementById("outside");
            image.onload = function() {
                outside.style.height = `${image.height}px`;
                outside.style.width = `${image.width}px`;
                canvas.height = image.height;
                canvas.width = image.width;
                ctx.current.clearRect(0,0,canvas.width,canvas.height);
                ctx.current.drawImage(image,0,0,image.width,image.height,0,0,image.width,image.height);
                setCounter(0);
                setRect([]);
                setLine([]);
                setLabelel([]);
                setCoord([]);
                setImg(image);
                const canvascont = document.getElementById("canvascontainer");
                canvascont.style.height = `${image.height}px`;
                canvascont.style.width = `${image.width}px`;
            }
            image.src = url;
        })
    }

    return(
        <div className="overallflex">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">AMS-Net</a>
                    <a className="navbar-brand small-size" href="/">Home</a>
                    <a className="navbar-brand small-size" href="#">Labeling Tool</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                {/* <a className="nav-link active" aria-current="page" href="#" onClick={homePage}>Home</a> */}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="menuflex tools-style">
                <div>
                    <form action="/action_page.php">
                            <label htmlFor="myfile">Upload an image:  </label>
                            <input type="file" onChange={handleClick}/>
                    </form>
                    <div className="dropdowncontainer">
                        <div>Or choose a sample circuit diagram: <button onClick={triggerdropdown} className="btn btn-outline-primary btn-sm">Choose Sample</button></div>
                        {dropdown && (
                            <ul className="dropdown">
                                <li onClick={handlecircuit} value="sample_1">Circuit 1</li>
                                <li onClick={handlecircuit} value="sample_2">Circuit 2</li>
                                <li onClick={handlecircuit} value="sample_3">Circuit 3</li>
                                <li onClick={handlecircuit} value="sample_4">Circuit 4</li>
                                <li onClick={handlecircuit} value="sample_5">Circuit 5</li>
                            </ul>
                        )}
                    </div>
                    <div>
                        <button className="btn btn-outline-primary btn-sm" onClick={changecoor}>{showcoor ? "Hide Coordinates" : "Show Coordinates"}</button>
                        <button className="btn btn-outline-primary btn-sm" onClick={changelabel}>{showlabel ? "Hide Labels" : "Show Labels"}</button>
                    </div>
                    <div>
                        <button className="btn btn-outline-primary btn-sm" onClick={clearall}>
                            Clear All
                        </button>
                        <button className="btn btn-outline-primary btn-sm"onClick={undo}>
                            Undo
                        </button>
                        <button className="btn btn-outline-primary btn-sm" onClick={remove}>Remove Image</button>

                    </div>
                    <div>
                    <button className="btn btn-outline-success btn-sm" onClick={download}>Download Canvas</button>
                    <button className="btn btn-outline-success btn-sm" onClick={downloadjson}>Download JSON</button>
                    </div>
                    
                    <button className="btn btn-outline-success btn-sm" onClick={fetchdata}>Identify Elements</button>
                    <button className="btn btn-outline-success btn-sm" onClick={getnetlist}>Get Netlist</button>
                    <div>{coor.x},{coor.y}</div>
                </div>
                <div>
                    <div>
                        <h2 style={{fontWeight: "bold", fontSize: "20px"}}>Select/Create an identifier:</h2>
                        <button onClick={createlabel} className="btn btn-primary btn-sm">Create new label</button>
                        <button onClick={deletelabel} id="delete" className="btn btn-primary btn-sm">Delete label</button>
                        <div className="menu">
                            {(label === false) ? <div>You dont have any labels</div> : <select select ref={selectRef} onChange={handleLabelChange} id="select" size="5">
                                            {/* <option onChange={handleLabelChange}>JAMES</option> */}
                                        </select> }
                        </div>
                    </div>
                    <div>
                        <h2 style={{fontWeight: "bold", fontSize: "20px"}}>Select/Create a label:</h2>
                        <button onClick={createglobal} className="btn btn-primary btn-sm">Create new label</button>
                        <button onClick={deleteglobal} id="delete" className="btn btn-primary btn-sm">Delete label</button>
                        <button onClick={toggleaddglobal} id="delete" className="btn btn-primary btn-sm">{addglobal ? "Remove tag" : "Add tag"}</button>
                        <div className="menu">
                            {(globalselect === false) ? <div>You dont have any labels</div> : <select ref={selectglobalRef} onChange={handleglobalchange} id="selectglobal" size="5">
                                        </select> }
                        </div>
                    </div>
                </div>
                <div>
                <h2 style={{fontWeight: "bold", fontSize: "20px"}}>Labelled components:</h2>

                <button onClick={deleteimage} id="delete" className="btn btn-primary btn-sm">Delete component</button>
                <button className="btn btn-primary btn-sm" onClick={displayhighlight}>Highlight component</button>
                <button className="btn btn-primary btn-sm" onClick={hidehighlight}>Hide component</button>
                {/* {showall ? "Hide all" : "Show all"} */}
                <button className="btn btn-primary btn-sm" onClick={toggleall}>{showall ? "Hide all" : "Show all"}</button>
                <div className="menu">
                    {(hascomponent === false) ? <div>Labelled component names will be displayed here!</div> : 
                    <select  id="select" size="10" onChange={handleimagelabel}>
                                   {imagenames.map((name,index) => (
                                    <option id={index} value={name}>{name}</option>
                                   ))
                                   }
                    </select> } 
                </div>
                </div>
                <div>
                    <h2 style={{fontWeight: "bold", fontSize: "20px"}}>Uploaded images:</h2>

                    <button onClick={deletecircuit} id="delete" className="btn btn-primary btn-sm">Delete image</button>
                    <button className="btn btn-primary btn-sm" onClick={displaycircuit}>Select image</button>
                    {/* {showall ? "Hide all" : "Show all"} */}
                    <div className="menu">
                    {(hascircuitlist === false) ? <div>Uploaded images will be displayed here!</div> : 
                    <select  id="select" size="10" onChange={handlecircuitlabel}>
                                   {circuitnames.map((name,index) => (
                                    <option id={index} value={name.slice(0,-4)}>{name}</option>
                                   ))
                                   }
                    </select> } 
                </div>
            </div>
            </div>
            <div id="canvascontainer" className="tools-style">
                <div id='imgbuttons'>
                    <button className="btn btn-primary btn-sm" onClick={handlediagram} value='0'>Original Diagram</button>
                    <button className="btn btn-primary btn-sm" onClick={handlediagram} value="0_cpnt">Component Diagram</button>
                    <button className="btn btn-primary btn-sm" onClick={handlediagram} value="0_net">Net Diagram</button>
                </div>
                <div id="globallabel" onKeyDown={createname} contentEditable="true">{globallabel}</div>
                <div id="outside">
                    <div className="inside">
                        <canvas id="mycanvas" className="covering" 
                                width= "800px"
                                height= "800px"
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                                onMouseMove={handleMouseMove}
                                ref={canvasRef}>Canvas</canvas>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Draw;
