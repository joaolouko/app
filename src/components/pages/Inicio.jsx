import { useEffect, useState } from "react";
import Header from "../layout/Header"
import axios from 'axios'

function Inicio() {

    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/data');
                setData(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };
        fetchData();
    }, []);
    console.log(data)
    return (

        <>
        <Header/>
            <div>
                <h1>pagina de inicio</h1>
                <h2>salas disponiveis</h2>
                <ul>
                {data && data.map((item, index) => (
                        <>
                            <li key={index}>nome: {item.nome}</li>
                        </>
                    ))}
                </ul>
                    
               
            </div>
        </>
    )
}

export default Inicio