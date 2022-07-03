console.log("Welcome to the IDE");

//setup editor theme and language
var editor = ace.edit("editor");
editor.setTheme("ace/theme/tomorrow");
editor.session.setMode("ace/mode/c_cpp");
//c_cpp, java, python
var java_template = `import java.util.*;
import java.lang.*;
import java.io.*;

/* Name of the class has to be 'Main' only if the class is public. */

class Main {
    public static void main (String[] args) throws java.lang.Exception {
        //Write your code from here
    }
}`;
var python_template = "# Write your code from here"
var cpp_template = "#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n\t//Write your code here\n\treturn 0;\n}"
getCookie();
editor.setValue(cpp_template);

let setData = function () {
    //console.log("setting cookie");
    var days = 30;
    var value = "";
    if (lang_code == 0) {
        value = "cpp:" + editor.getValue();
    } else if (lang_code == 1) {
        value = "python:" + editor.getValue();
    } else {
        value = "java:" + editor.getValue();
    }
    localStorage.setItem("code", value);
}

setInterval(setData, 5000, "");
var langs = ["cpp", "python", "java"];
var lang_code = 0;
function change_lang(x) {
    getCookie();
    lang_code = x;
    if (lang_code == 0) {
        editor.session.setMode("ace/mode/c_cpp");
        editor.setValue(cpp_template);
    } else if (lang_code == 1) {
        editor.session.setMode("ace/mode/python");
        editor.setValue(python_template);
    } else {
        editor.session.setMode("ace/mode/java");
        editor.setValue(java_template);
    }
}

function getCookie() {
    var code = localStorage.getItem("code");
    if (code == null) {
        console.log("not found");
        return;
    }
    code = code.split(":");
    if (code[0] === "cpp") {
        cpp_template = code[1];
    } else if (code[0] === "python") {
        python_template = code[1];
    } else {
        java_template = code[1];
    }
}

function savefile() {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(editor.getValue()));
    if (lang_code == 0) {
        element.setAttribute('download', "cpp");
    } else if (lang_code == 1) {
        element.setAttribute('download', "python");
    } else {
        element.setAttribute('download', "java");
    }

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

//after clicking on button, submission happens
function clicke() {
    setData();
    document.getElementById("clicke").disabled = true;
    document.getElementById('clicke').style.backgroundColor = 'grey';
    document.getElementById("output_txt").innerHTML = "Please wait...\nYour code is running on our servers...";
    //POST Request
    var sc = editor.getValue();
    var inp = document.getElementById("input_txt").value;
    var lang = langs[lang_code];

    function encodeQueryData(data) {
        const ret = [];
        for (let d in data)
            ret.push(
                encodeURIComponent(d) + "=" + encodeURIComponent(data[d])
            );
        return ret.join("&");
    }

    const params = {
        source_code: sc,
        language: lang,
        input: inp,
        api_key: "guest",
    };

    var url = "http://api.paiza.io:80/runners/create?" + encodeQueryData(params);

    console.log(params, url);
    //getting id of submission and result of submission
    fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            setTimeout(() => {
                //getting result of submission
                var ide = json.id;
                console.log(ide);
                const params = {
                    id: ide,
                    api_key: "guest",
                };

                var url1 = "http://api.paiza.io:80/runners/get_details?" + encodeQueryData(params);
                console.log(url1);

                fetch(url1)
                    .then((data) => {
                        return data.json();
                    })
                    .then((post) => {
                        console.log(post);
                        console.log(post.stdout);
                        if (post.build_result === "failure") {
                            console.log("failure", post.build_stderr);
                            document.getElementById("output_txt").innerHTML = post.build_stderr;
                            document.getElementById('clicke').style.backgroundColor = 'green';
                            document.getElementById("clicke").disabled = false;
                        } else {
                            if (post.result === "timeout") {
                                document.getElementById("output_txt").innerHTML = "Timeout : Runtime Error";
                                document.getElementById('clicke').style.backgroundColor = 'green';
                                document.getElementById("clicke").disabled = false;
                            } else {
                                document.getElementById("output_txt").innerHTML = post.stdout;
                                document.getElementById('clicke').style.backgroundColor = 'green';
                                document.getElementById("clicke").disabled = false;
                            }

                        }
                    });
            }, 7000)
        })
        .catch((err) => {
            console.log(err);
            document.getElementById('clicke').style.backgroundColor = 'green';
            document.getElementById("clicke").disabled = false;
        });
}
