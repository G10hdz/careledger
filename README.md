# EntreManos

**[English](README.en.md)** · Banco de tiempo de cuidados. Una hora de cuidado,
una hora de vuelta. Build for Her 2026, equipo 7.

Quien cuida a su familia gana horas cuidando a otra familia de su colonia, y
las usa cuando necesita relevo o el oficio de alguien cercano. Las horas no se
compran ni se venden. El piloto arranca en la alcaldía Iztapalapa.

## Pruébalo

| Qué | Dónde |
| --- | --- |
| Landing | <https://g10hdz.github.io/entremanos/> |
| Banco de tiempo (entra como Ana o como Luis) | <https://g10hdz.github.io/entremanos/app/> |
| Panel para gobierno | <https://g10hdz.github.io/entremanos/gobierno/> |
| Video del recorrido, 79 s | [Release demo-2026-11-07](https://github.com/G10hdz/careledger/releases/tag/demo-2026-11-07) |

Todo usa personas y cifras de prueba, y así está marcado en cada pantalla. El
banco de tiempo guarda los datos en el navegador; no hay servidor.

Los links de arriba son una versión estática construida desde este repo
(`main` en `059ba55`), publicada en GitHub Pages desde
[G10hdz/entremanos](https://github.com/G10hdz/entremanos). El dominio principal,
<https://entremanos-mx.vercel.app>, se publica desde el CI y hoy muestra la
versión anterior: Vercel llegó a su límite de 100 publicaciones al día.

## El problema

- 31.7 millones de personas de 15 años y más daban cuidados en 2022; el 75.1%
  eran mujeres (INEGI, ENASIC 2022).
- Las mujeres dedicaban 28.8 horas a la semana a cuidar; los hombres, 12.9
  (INEGI, ENUT 2019).
- El trabajo doméstico y de cuidados no pagado vale el 26.3% del PIB (INEGI,
  Cuenta Satélite 2023).

La causa de fondo es la falta de tiempo: el cuidado se queda en pocas manos,
no se registra y no se puede pedir de vuelta. Ciudad que Cuida a quien Cuida
da hasta 6,000 pesos al año a 1,000 personas, cuando su población objetivo es
de 3,080,632. Detalle y fuentes: [`docs/pitch/problema-y-politicas.md`](docs/pitch/problema-y-politicas.md).

## Cómo funciona

1. Ana necesita que alguien acompañe a su papá al médico y pide 2 horas a Luis,
   su vecino.
2. Luis lo acompaña y marca "Ya lo hice".
3. Ana confirma. Su saldo queda en −2 h y el de Luis en +2 h. Ana las devuelve
   después cuidando o con su oficio.

Reglas, todas con pruebas en [`packages/domain/src/timebank.ts`](packages/domain/src/timebank.ts):

- Una hora vale una hora, sea de cuidado o de una profesión.
- Todo intercambio incluye cuidado; oficio por oficio no se acepta.
- Confirma la familia cuidada o una tercera persona; nadie se confirma a sí mismo.
- El saldo puede bajar hasta −5 horas.
- Bloques de 15 minutos, con mínimo de 30 por servicio.
- Máximo 8 horas al día por persona y 20 al mes entre las mismas dos cuentas.
- Tres niveles de habilitación (N0, N1, N2) deciden quién ofrece qué; no cambian el valor de la hora.
- Las personas servidoras públicas no ofrecen servicios.

Especificación completa: [`specs/09-banco-tiempo.md`](specs/09-banco-tiempo.md).

## Qué está construido

| App | Qué hace |
| --- | --- |
| `apps/entremanos` | Landing y banco de tiempo: personas de prueba, pedir, hecho, confirmar, saldo y topes. |
| `apps/gobierno` | Panel de impacto: escenarios de valor social, libro de folios con detalle y origen de los datos. |
| `packages/domain` | Reglas compartidas del banco de tiempo y de Puntos Cívicos, con sus pruebas. |
| `apps/landing` | Landing anterior, publicada en Vercel. |
| `apps/pwa`, `apps/comercios`, `apps/servicios` | Puntos Cívicos, la primera versión del proyecto: registro offline, vales firmados y terminal de comercios. El pitch se centra en el banco de tiempo. |

Pruebas: 247 en 18 archivos, en verde. El CI corre typecheck, pruebas, build y
gitleaks en cada PR.

## Correrlo

Requisitos: Node 22+ y pnpm 9+.

```bash
pnpm install
pnpm -r typecheck
pnpm -r test
pnpm --filter @careledger/entremanos dev   # landing en / y banco en /app
pnpm --filter @careledger/gobierno dev     # panel en /gobierno
```

## Datos e IA

- Ninguna IA decide sobre nadie. Las horas las confirma la familia. Usamos IA
  para programar, con revisión humana.
- Se guarda la duración y el tipo de ayuda. Nunca nombres de pacientes,
  diagnósticos ni fotos.
- No se venden datos. Para política pública, solo cifras agregadas y anónimas,
  con consentimiento.

Detalle: [`docs/pitch/ia-y-preguntas.md`](docs/pitch/ia-y-preguntas.md).

## Quién paga

Para la cuidadora cuesta cero y las horas nunca se compran. La operación
(coordinar, verificar y asegurar cada grupo) la pagarían alcaldías y empresas,
y el piloto un fondo de arranque. Supuestos, riesgos y criterios para parar:
[`docs/pitch/modelo-de-negocio.md`](docs/pitch/modelo-de-negocio.md).

## Siguiente paso

Piloto de 3 meses con 50 usuarias en una colonia de Iztapalapa. Se mide:
horas de relevo por cuidadora, carga con la escala Zarit al inicio y al final,
qué parte de las horas dan hombres y vecinos sin dependiente, y cuántas horas
pedidas por adelantado se devuelven.

Pendientes que resuelve el piloto: el método de verificación de dependencia y
horas, el seguro de responsabilidad civil, el aviso de privacidad, qué pasa con
las horas de quien se va y cómo entra quien no tiene celular propio.

## Equipo

Yulie (mentora), Karla, Jeaneth, Mayte, Daniela, Nelly y Moni.

## Más

- Documento fuente del equipo: [`docs/fuente-cuando-cuidas-te-descuidas-v3.md`](docs/fuente-cuando-cuidas-te-descuidas-v3.md)
- Especificaciones: [`specs/`](specs/)
- Decisiones de arquitectura: [`docs/adr/`](docs/adr/)
- Despliegue: [`docs/runbook-despliegue.md`](docs/runbook-despliegue.md)
- Trabajo en paralelo con varios agentes: [`AGENTS.md`](AGENTS.md)

## Licencia

[MIT](LICENSE)
