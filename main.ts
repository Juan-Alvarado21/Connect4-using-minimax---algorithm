interface Punto {
	x: number;
	y: number;
}

enum Estado {
	j1,
	j2,
	vacio
}

function randint(min:number, max:number):number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function puntoAInt(p: Punto) : Punto {
	return {x : Math.floor(p.x), y : Math.floor(p.y)};
}

class Nodo {
	estado: Estado;
	pos: Punto;
	constructor(pos: Punto, estado: Estado = Estado.vacio) {
		this.estado = estado;
		this.pos = puntoAInt(pos);
	}
}

class Tablero {
	tamX: number;
	tamY: number;
	dim: Punto;
	nodos: Nodo[][];
	cantNodos: number[]; // Cantidad de nodos que existen en cada columna
	movs: Set<number>;
	pasosColumna: number[];
	pasosJugador: Estado[];

	constructor(dim: Punto) {
		this.dim = puntoAInt(dim);
		this.tamX = this.dim.x;
		this.tamY = this.dim.y;
		this.pasosJugador = [];
		this.pasosColumna = [];

		this.nodos = [];

		// Inicializa el matriz de nodos en 0
		for(let i=0;i<this.tamY;i++) {
			var fila:Nodo[] = [];
			for(let j=0;j<this.tamX;j++) {
				fila.push(new Nodo({y:i, x:j}));
			}
			this.nodos.push([...fila]);
		}

		// optimizar
		// Inicializar un arreglo de valores numéricos, hasta 0.
		this.cantNodos = [];
		for(let i=0;i<this.tamX;i++) {
			this.cantNodos.push(0);
		}

		// agrega todas las columnas como parte de los movimientos posibles.
		this.movs = new Set<number>;
		for(let i=0;i<this.tamX;i++) {
			this.movs.add(i);
		}
	}

	enTabla(p:Punto) : boolean{
		var pInt = puntoAInt(p);
		if(pInt.x>=0 && pInt.x < this.tamX) {
			if(pInt.y>=0 && pInt.y < this.tamY) {
				return true;
			}
		}
		return false;
	}

	lleno(columna:number):boolean {
		if(columna>=0 && columna < this.tamX) {
			if(this.cantNodos[columna] >= this.tamY) {
				return true;
			} else {
				return false;
			}
		} else {
			console.log("Error: columna fuera del tablero");
			return true;
		}
	}

	insertar(columna:number, jugador:Estado) {
		if(Estado.vacio !== jugador) {
			if(!this.lleno(columna)) { // OPT: Posiblemente cambiar al valor que prueba si esta en el set
				this.nodos[this.tamY - this.cantNodos[columna]-1][columna].estado = jugador; // Debería de añadirlo al final
				this.cantNodos[columna]++;
				if(this.lleno(columna)) {
					this.movs.delete(columna);
				}

				this.pasosColumna.push(columna);
				this.pasosJugador.push(jugador);
				return true;
			} else {
				console.log("Favor de insertar una columna que no este lleno");
				return false;
			}
		} else {
			console.log("Favor de insertar un jugador, y no vacio");
			return false;
		}
	}

	getMovs():Set<number>{
		// Retorna los columnas disponibles
		return this.movs;
	}

	getNodo(p:Punto):Nodo|null {
		if(this.enTabla(p)) {
			return this.nodos[p.y][p.x];
		} else {
			console.log("Error, no existe el nodo en la tabla.");
			return null;
		}
	}

	print() {
		let line:string = "";

		for(let i=0;i<this.tamY;i++) {
			line = "";
			line += i.toString() + " ";
			for(let j=0;j<this.tamX;j++) {
				switch(this.nodos[i][j].estado) {
					case Estado.j1:
						line += "X";
						break;
					case Estado.j2:
						line += "0";
						break;
					default:
						line += "_";
						break;
				}
			}
			console.log(line);
		}
	}

	clonar() :Tablero{
		var nuevoTab:Tablero = new Tablero(this.dim);

		for(let i=0;i<this.pasosColumna.length;i++) {
			nuevoTab.insertar(this.pasosColumna[i],this.pasosJugador[i]);
		}

		return nuevoTab;
	}
}

function crearCeldasHtml() {
//	var styles: string = ' \
//		.caja { \
//		display: grid; \
//		grid-template-columns: repeat(' + tab.tamX + ' , 1fr); } ' + '.caja button { width: 100px; height:100px;}';
	var styles:string = '.caja {width:400px;} .caja button{width:calc(100%/' + tab.tamX + '); aspect-ratio:1 / 1;float: left}';
	var styleSheet = document.createElement("style");
	styleSheet.innerText = styles;
	document.head.appendChild(styleSheet);

	let cont:HTMLElement|null = document.getElementById("contenedor");

	if(cont !== null) {
		var linea:string = '<button id="num" class="estilo" type="button" onclick="pressed(this)"></button>';

		var wrapper = document.createElement("div");

		for(let j=0;j<tab.tamY;j++) {
			for(let i=0;i<tab.tamX;i++) {
				wrapper.innerHTML = linea.replace("num", (j*tab.tamX + i + 1).toString());
				cont.appendChild(wrapper.firstChild as Node);
			}
		}
	} else {
		console.log("No se encontró nodo");
	}
}

function main() {
	crearCeldasHtml();
}

var modoJuego:number = 0;
var dimensionesGlobales = {x:7,y:6};
//var dimensionesGlobales = {x:10,y:10};
var tab:Tablero = new Tablero(dimensionesGlobales);
var estado:Estado = Estado.j1;
var j1EsPersona:Boolean = true;
var j2EsPersona:Boolean = true;
var corriendo:Boolean = true;;
var prof:number = 5;

main();

// Funciones de interfaz

function iniciarJuego() {
	// Modos de juego
	// persona x computadora (se asignará aleatoriamente
	// persona x persona
	// computadora x computadora
	tab = new Tablero(dimensionesGlobales);
	refresh();
	corriendo = true;
	estado = Estado.j1;

	var selectedValue:HTMLInputElement = document.querySelector('input[name="prueba"]:checked') as HTMLInputElement;

	switch(selectedValue.value) {
		case "hh":
			console.log("Aqui");
			modoJuego = 1;
			break;
		case "hc":
			modoJuego = 0;
			break;
		case "cc":
			modoJuego = 2;
			break;
	}

	switch(modoJuego) {
		case 0:
			j1EsPersona = (randint(0,1) === 1);
			j2EsPersona = !j1EsPersona;
			if(!j1EsPersona) {
				window.setTimeout(function() {
					const [_,mov] = alphaBeta_minimax(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY,tab, prof, 1);
					if(mov !== null ){
						tab.insertar(mov,Estado.j2);
					} else {
						console.log("No se pudo encontrar el primer movimiento???.");
					}
					refresh();
				}, 0);
			}
			break;
		case 2:
			j1EsPersona = false;
			j2EsPersona = false;
			// todo
			break;
		default:
			j1EsPersona = true;
			j2EsPersona = true;
			break;
	}
}

function mensajeTerminado() {
	// Mediante el estado actual, determina si el juego haya terminado o no, y si ha terminado, coloca un mensaje.
	// todo: Agregar mensaje visual.
	let output:string = "";
	if(tab.getMovs().size === 0) {
		output = "Juego terminado, empate";
		corriendo = false;
	}
	let ganador:Estado = getGanador(tab);
	if(ganador !== Estado.vacio) {
		if(ganador === Estado.j1) {
			output = "Juego terminado, gano el jugador 1";
		} else {
			output = "Juego terminado, gano el jugador 2";
		}
		corriendo = false;
	}

	let salida:Element = document.getElementById("mensaje")!;
	salida.innerHTML = output;
}

function pressed(objeto:HTMLElement) {
	if(corriendo && modoJuego !== 2) { // No se accepta presionar un botón, si el juego ha terminado, o son dos computadoras
		let z = parseInt(objeto.id);
		z--;
		let xi = (z%tab.tamX);
		let yi = Math.floor(z/tab.tamX);
		let p1:Punto = {x: xi, y:yi};
		// ambos son personas

		if(modoJuego === 1) {
			let movValido:boolean = tab.insertar(p1.x, estado);
			if(movValido) {
				refresh();
				if(estado === Estado.j1) {
					estado = Estado.j2;
				} else {
					estado = Estado.j1;
				}
			} else {
				console.log("Columna invalida");
			}
		} else {
			// 1 es persona
			let movValido:boolean = tab.insertar(p1.x, estado);
			if(movValido){
				let numJugador:number;
				if(j1EsPersona) {
					// Computadora es min
					numJugador = 0;
				} else {
					// computadora es max
					numJugador = 1;
				}
				window.setTimeout(function() {
					const [_,mov] = alphaBeta_minimax(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY,tab, prof, numJugador);
					if(mov !== null ){
						tab.insertar(mov,Estado.j2);
					} else {
						console.log("Ya no existen más movimientos para la computadora");
					}
					refresh();
				}, 0);
			}
		}
	}
}

function refresh() {
	// p1 es rojo
	for(let i=0;i<tab.tamY;i++) {
		for(let j=0;j<tab.tamX;j++) {
			let a:HTMLElement|null = document.getElementById((i*tab.tamX + j + 1).toString());

			if(a!==null) {
				switch(tab.nodos[i][j].estado) {
					case Estado.j1:
						a.className = "rojo";
						break;
					case Estado.j2:
						a.className = "amarillo";
						break;
					default:
						a.className = "estilo";
						break;
				}
			} else {
				console.log("No se encontro elemento en tabla funcion refresh")
			}

		}
	}
	mensajeTerminado();
}

// Funciones de alfa y beta

function alphaBeta_minimax(alpha: number, beta: number, tablero: Tablero, profundidad: number, jugador: number): [number, number|null] {

    //caso base    
    if (profundidad === 0) {
        return [heuristica(tablero), null];  
    }

    let best_move:number = -1;

    /*Si el jugador es MAX (sabemos que max tiene el valor 1 para diferenciarlo)*/
    
    if (jugador === 1) {  
        let valor: number = Number.NEGATIVE_INFINITY;
		let nodos_hijo:Set<number> = tablero.getMovs(); // Todos los movimientos hijo

        for (const movimiento of nodos_hijo) {    //para cada posibilidad o nodo hijo 

            //creamos una copia del tablero y movemos la pieza, validamos y se manda a llamar la funcion rec.

            let tablero_nuevo: Tablero = tablero.clonar();
			tablero_nuevo.insertar(movimiento, Estado.j1);
            const [nuevo_valor, _] = alphaBeta_minimax(alpha, beta, tablero_nuevo, profundidad - 1, 0);  // Obtenemos el valor heredado
            
			if(nuevo_valor > valor) {
				valor = nuevo_valor;
				best_move = movimiento;
			}

			if( valor > beta ) {
				break;
			}

			alpha = Math.max(alpha,valor);
        }
        return [valor, best_move];    //devuelve valor y coordenada de mejor jugada
    } 
    

    /* Si el jugador es MIN (0) */

    else {  
        let valor: number = Number.POSITIVE_INFINITY;
		let nodos_hijo:Set<number> = tablero.getMovs(); // Todos los posibles movimientos

        for (const movimiento of nodos_hijo) {    //para cada posibilidad o nodo hijo 
            //creamos una copia del tablero y movemos la pieza, validamos y se manda a llamar la funcion rec.

            let tablero_nuevo: Tablero = tablero.clonar();
			tablero_nuevo.insertar(movimiento, Estado.j2);
            const [nuevo_valor, _] = alphaBeta_minimax(alpha, beta, tablero_nuevo, profundidad - 1, 1);  // Obtenemos el valor heredado
            if (nuevo_valor < valor) {
                valor = nuevo_valor;
                best_move = movimiento;  // Actualiza el mejor movimiento 
            }
			if(valor < alpha) {
				break;
			}
            beta = Math.min(beta, valor);
        }
        return [valor, best_move];    //devuelve valor y coordenada de mejor jugada
    }
}

function heuristica(tablero:Tablero): number {
	// La función heurística siempre maximizará respecto j1. Al ser que max siempre tira la primera jugada
	// j2 siempre será el jugador min
	//
	
	let gan:Estado = getGanador(tablero);
	if(gan !== Estado.vacio) {
		if(gan === Estado.j1) {
			return Number.POSITIVE_INFINITY;
		} else {
			return Number.NEGATIVE_INFINITY;
		}
	}

    const evaluacion: number = tres_linea(tablero, Estado.j1) + dos_linea(tablero, Estado.j1) + uno_linea(tablero, Estado.j1) - (tres_linea(tablero, Estado.j2) + dos_linea(tablero, Estado.j2) + uno_linea(tablero, Estado.j2));
    return evaluacion;
}

function getGanador(tabEnt:Tablero) : Estado {
	if(verificar_ganador(tabEnt, Estado.j1)) {
		return Estado.j1;
	} else if (verificar_ganador(tabEnt,Estado.j2)) {
		return Estado.j2;
	} else {
		return Estado.vacio;
	}
}

function verificar_ganador(tabEnt: Tablero, pieza: Estado): boolean {
	
	let tablero:Nodo[][] = tabEnt.nodos;
    // verificar posiciones horizontales
    for (let x = 0; x < tabEnt.tamY; x++) {
        for (let y = 0; y < tabEnt.tamX - 3; y++) {
            if (tablero[x][y].estado === pieza && tablero[x][y + 1].estado === pieza && tablero[x][y + 2].estado === pieza && tablero[x][y + 3].estado === pieza) {
                //console.log("\nFin de la partida", pieza, "Gana");
                return true;
            }
        }
    }

    // verificar posiciones verticales
    for (let y = 0; y < tabEnt.tamX; y++) {
        for (let x = 0; x < tabEnt.tamY - 3; x++) {
            if (tablero[x][y].estado === pieza && tablero[x + 1][y].estado === pieza && tablero[x + 2][y].estado === pieza && tablero[x + 3][y].estado === pieza) {
                //console.log("\nFin de la partida", pieza, "Gana");
                return true;
            }
        }
    }

    // verificar posiciones diagonales derecha a izquierda
    for (let x = 0; x < tabEnt.tamY - 3; x++) {
        for (let y = 0; y < tabEnt.tamX - 3; y++) {
            if (tablero[x][y].estado === pieza && tablero[x + 1][y + 1].estado === pieza && tablero[x + 2][y + 2].estado === pieza && tablero[x + 3][y + 3].estado === pieza) {
                //console.log("\nFin de la partida", pieza, "Gana");
                return true;
            }
        }
    }

    // verificar posiciones diagonales izquierda a derecha
    for (let x = 0; x < tabEnt.tamY - 3; x++) {
        for (let y = 3; y < tabEnt.tamX; y++) {
            if (tablero[x][y].estado === pieza && tablero[x + 1][y - 1].estado === pieza && tablero[x + 2][y - 2].estado === pieza && tablero[x + 3][y - 3].estado === pieza) {
                //console.log("\nFin de la partida", pieza, "Gana");
                return true;
            }
        }
    }

    return false;
}

function uno_linea(tabEnt:Tablero, pieza: Estado):number {
    let combinaciones: number = 0;
	let tablero:Nodo[][] = tabEnt.nodos;

	for(let i=0;i<tabEnt.tamY;i++) {
		for(let j=0;j<tab.tamX;j++) {
			if(tablero[i][j].estado === pieza) {
				combinaciones+=1;
			}
		}
	}

	return combinaciones;
}

function dos_linea(tabEnt:Tablero, pieza: Estado): number {
    let combinaciones: number = 0;
	let tablero:Nodo[][] = tabEnt.nodos;

    // Verificar combinaciones 2 Verticalmente
    for (let i = 0; i < tabEnt.tamX; i++) {
        for (let j = 0; j < tabEnt.tamY - 1; j++) {
            if (tablero[j][i].estado === pieza && tablero[j + 1][i].estado === pieza) {
                combinaciones += 1;
            }
        }
    }

    // Verificar combinaciones 2 Horizontalmente
    for (let i = 0; i < tabEnt.tamY; i++) {
        for (let j = 0; j < tabEnt.tamX - 1; j++) {
            if (tablero[i][j].estado === pieza && tablero[i][j + 1].estado === pieza) {
                combinaciones += 1;
            }
        }
    }

    // Verificar combinaciones 2 Diagonal izq a der
    for (let i = 0; i < tabEnt.tamY - 1; i++) {
        for (let j = 0; j < tabEnt.tamX - 1; j++) {
            if (tablero[i][j].estado === pieza && tablero[i + 1][j + 1].estado === pieza) {
                combinaciones += 1;
            }
        }
    }

    // Verificar combinaciones 2 Diagonal derecha a izq
    for (let i = 0; i < tabEnt.tamY - 1; i++) {
        for (let j = 1; j < tabEnt.tamX; j++) {
            if (tablero[i][j].estado === pieza && tablero[i + 1][j - 1].estado === pieza) {
                combinaciones += 1;
            }
        }
    }

    return combinaciones;
}

function tres_linea(tabEnt:Tablero, pieza: Estado): number {
    let combinaciones: number = 0;
	let tablero:Nodo[][] = tabEnt.nodos;

    // Verificar combinaciones 3 Verticalmente
    for (let i = 0; i < tabEnt.tamX; i++) {
        for (let j = 0; j < tabEnt.tamY - 2; j++) {
            if (tablero[j][i].estado === pieza && tablero[j + 1][i].estado === pieza && tablero[j + 2][i].estado === pieza) {
                combinaciones += 1;
            }
        }
    }

    // Verificar combinaciones 3 Horizontalmente
    for (let i = 0; i < tabEnt.tamY; i++) {
        for (let j = 0; j < tabEnt.tamX - 2; j++) {
            if (tablero[i][j].estado === pieza && tablero[i][j + 1].estado === pieza && tablero[i][j + 2].estado === pieza) {
                combinaciones += 1;
            }
        }
    }

    // Verificar combinaciones 3 Diagonal derecha a izq
    for (let i = 0; i < tabEnt.tamY - 2; i++) {
        for (let j = 2; j < tabEnt.tamX; j++) {
            if (tablero[i][j].estado === pieza && tablero[i + 1][j - 1].estado === pieza && tablero[i + 2][j - 2].estado === pieza) {
                combinaciones += 1;
            }
        }
    }

    // Verificar combinaciones 3 Diagonal izq a der
    for (let i = 0; i < tabEnt.tamY - 2; i++) {
        for (let j = 0; j < tabEnt.tamX - 2; j++) {
            if (tablero[i][j].estado === pieza && tablero[i + 1][j + 1].estado === pieza && tablero[i + 2][j + 2].estado === pieza) {
                combinaciones += 1;
            }
        }
    }

    return combinaciones;
}

// tsc main.ts --outFile out.js --target es6
