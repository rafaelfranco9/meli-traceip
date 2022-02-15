# MELI-TRACEIP-APP
#
## Ejercicio técnico 
___
## Descripción general
> Para coordinar acciones de respuesta ante fraudes, es útil tener disponible información contextual del lugar de origen detectado en el momento de comprar, buscar y pagar. Para ello, entre otras fuentes, se decide crear una herramienta que dado un IP obtenga información asociada.
___
#
## Requerimientos

1. **Construir una aplicación que dada una dirección IP, encuentre el país al que pertenece, y muestre:**
   * El nombre y código ISO del país
   * Los idiomas oficiales del país
   * Hora(s) actual(es) en el país (si el país cubre más de una zona horaria, mostrar
todas)
   * Moneda local, y su cotización actual en dólares (si está disponible)
   * Distancia estimada entre Buenos Aires y el país, en km
  
2. **Basado en la información anterior, es necesario contar con un mecanismo para poder consultar las siguientes estadísticas de utilización del servicio con los siguientes agregados:**
   * Distancia más lejana a Buenos Aires desde la cual se haya consultado el servicio
   * Distancia más cercana a Buenos Aires desde la cual se haya consultado el servicio
   * Distancia promedio de todas las ejecuciones que se hayan hecho del servicio
  
3. **La aplicación puede ser en línea de comandos o web. En el primer caso se espera
que el IP sea un parámetro, y en el segundo que exista un form donde escribir la
dirección.**

#### Consideraciones
* La aplicación deberá hacer un uso racional de las APIs, evitando hacer llamadas innecesarias.
* La aplicación puede tener estado persistente entre invocaciones
* La cuenta a realizar para calcular el promedio de distancias seria:`( distancia1 * invocaciones_distancia1 + distancia2 * invocaciones_distancia2) / total_de_invocaciones`

#### Recursos disponibles
Para resolver la información se pueden utilizar la siguientes APIs públicas:
  * **Geolocalización de IPs:** ​https://ip2country.info/
  * **Información de paises:** ​http://restcountries.eu/
  * **Información sobre monedas:** ​http://fixer.io/
#
___
#
## Instalación
**1.** Clonar repositorio del proyecto
```sh
https://github.com/rafaelfranco9/meli-traceip
```
**2.** Posicionarse en la carpeta del proyecto
```sh
cd meli-traceip 
```
**3.** Iniciar aplicación
```sh
docker-compose up -d 
```
**4.** Abrir navegador e ingresar a `http://localhost:5000` 

**5.** Ingresa una dirección IP y mira los resultados!
#
___
#
## Usabilidad
El codigo desarrollado corresponde a una aplicación web que cuenta con los siguientes endpoints.
| Método | Endpoint | Descripción |
|--|--|--|
|GET|/ip/{ipAddress}| Optener informacion de la IP
|GET|/statistics| Optener estadisticas de maxima, minima y promedio de distancias
|GET|/statistics/all| Optener todas las estadisticas de las distancias invocadas
#
### Ejemplo

Si enviamos la siguiente direccion IP: *83.44.196.93* (que corresponde a españa)  al endpoint `/ip/{ipAddress}` tendremos como respuesta el siguiente objeto
```json
{
	"ip": "83.44.196.93",
	"date": "2/14/2022 10:55:35 PM",
	"country": {
		"spanishName": "España",
		"commonName": "Spain",
		"ISOcode": "ES",
		"coordinates": [
			40,
			-4
		],
		"languages": {
			"spa": "Spanish"
		},
		"currencies": [
			{
				"code": "EUR",
				"name": "Euro",
				"symbol": "€",
				"usdRate": 1.13045
			}
		],
		"timezones": [
			{
				"utcOverflow": "UTC",
				"time": "22:55:35"
			},
			{
				"utcOverflow": "UTC+01:00",
				"time": "23:55:35"
			}
		]
	},
	"distance": {
		"distanceInKm": 10275,
		"from": [
			-34,
			-64
		],
		"to": [
			40,
			-4
		]
	}
}
```
Esta información la veremos reflejada en nuestro navegador de la siguiente manera:

![alt text](../meli-traceip/public/app-screenshot.png)
---


## Dependencias


| Nombre | Descripción |
|--|--|
|[Nestjs](https://nestjs.com/)| Framework |
[jest](https://www.npmjs.com/package/jest)| Tests
|[cache-manager](https://www.npmjs.com/package/cache-manager)| Gestión de Cache
|[axios](https://www.npmjs.com/package/axios)| Peticiones Http
|[hbs](https://www.npmjs.com/package/hbs)| Motor de server side rendering
|[rxjs](https://www.npmjs.com/package/rxjs) | Observables
|[event-emitter](https://www.npmjs.com/package/event-emitter) | Eventos
#
___
#
## Tests
Para poder correr los `unit tests` debemos hacer lo siguiente:
1. Entrar a la terminal y posicionarnos en la carpeta del proyecto
```sh
cd meli-traceip 
```
2. Asegurarnos que el container de la app esta corriendo (en caso de no estarlo volver a correr el container con `docker-compose up -d`)
```sh
docker-compose ps 

      Name                    Command               State                    Ports
----------------------------------------------------------------------------------------------------
meli-traceip-app   docker-entrypoint.sh npm r ...   Up      0.0.0.0:5000->5000/tcp,:::5000->5000/tcp
```
3. Ingresar el siguiente comando dentro del container
```sh
docker exec -it meli-traceip-app npm run test:watch
```
