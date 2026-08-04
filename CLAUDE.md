# Instrucciones del proyecto — FabWebsite

## Flujo de trabajo obligatorio para cambios

Cada vez que la usuaria pida un cambio o ajuste (código, contenido, configuración, etc.) y ese cambio quede implementado, al terminar SIEMPRE debo, sin pedir confirmación adicional cada vez:

1. **Memorizar** — guardar en el sistema de memoria lo que sea relevante para sesiones futuras (qué cambió, por qué, pendientes nuevos), siguiendo las reglas normales de qué vale la pena memorizar.
2. **Commitear** — crear un commit de git con un mensaje claro que describa el cambio.
3. **Pushear** — hacer `git push` al remoto.

Esta autorización es permanente para este proyecto y cubre commit + push de trabajo ya solicitado explícitamente por la usuaria. No aplica a acciones fuera de ese alcance (p. ej. force-push, borrar ramas, tocar infraestructura AWS compartida — ver memoria `feedback_shared_aws_account`) — esas siguen requiriendo confirmación explícita caso por caso.

Si un cambio queda a medias, con errores de build, o la usuaria pide explícitamente no commitear todavía, esta regla no aplica hasta que el cambio esté completo y verificado.
