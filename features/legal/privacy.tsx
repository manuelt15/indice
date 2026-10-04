import { LegalLink, LegalList, LegalPage, LegalSection } from "@/components/ds/legal"
import { LEGAL } from "@/lib/legal"

export function Privacy() {
  return (
    <LegalPage
      title="Política de privacidad"
      updated={LEGAL.updated}
      intro="Qué datos guarda índice, para qué, durante cuánto tiempo y con quién se comparten. En corto: guardamos lo mínimo para que tu índice funcione, no hay publicidad ni analítica, y puedes exportar o borrar todo desde Ajustes."
    >
      <LegalSection label="responsable" title="Quién es responsable">
        <p>
          {LEGAL.owner}, persona física, responsable de índice. Para cualquier cuestión sobre tus datos escribe a{" "}
          <LegalLink href={`mailto:${LEGAL.email}`}>{LEGAL.email}</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection label="datos" title="Qué datos guardamos">
        <LegalList>
          <li>
            <strong className="font-medium text-foreground">Tu cuenta:</strong> correo electrónico y nombre. Si entras con Google
            o GitHub, guardamos qué proveedor usas, pero no tu foto ni acceso a esas cuentas.
          </li>
          <li>
            <strong className="font-medium text-foreground">Tu ciudad, si la indicas:</strong> nombre, país y el centro de la
            ciudad redondeado a un kilómetro aproximadamente. Nunca tu ubicación exacta ni el GPS.
          </li>
          <li>
            <strong className="font-medium text-foreground">Tus enlaces:</strong> dirección, nombre, título de la página,
            categoría, tags, si está fijado y la fecha en que lo guardaste.
          </li>
          <li>
            <strong className="font-medium text-foreground">Datos técnicos de la sesión:</strong> dirección IP y navegador con
            los que iniciaste sesión, para que puedas protegerla. Los códigos de acceso se guardan cifrados y caducan en 10
            minutos.
          </li>
        </LegalList>
        <p>No pedimos ni guardamos contraseñas, datos de pago ni categorías especiales de datos.</p>
      </LegalSection>

      <LegalSection label="finalidad" title="Para qué y con qué base legal">
        <LegalList>
          <li>
            Darte el servicio: guardar, ordenar y mostrarte tus enlaces, y mostrar tu ciudad en el pie de página (solo la ves
            tú). Base legal: la ejecución del contrato que aceptas al crear la cuenta (art. 6.1.b del RGPD).
          </li>
          <li>
            Proteger el servicio: limitar intentos de acceso y evitar abusos con la dirección IP de forma temporal. Base legal:
            interés legítimo en la seguridad (art. 6.1.f del RGPD).
          </li>
        </LegalList>
        <p>No usamos tus datos para publicidad, no los vendemos y no hacemos perfiles. Tampoco hay analítica.</p>
      </LegalSection>

      <LegalSection label="proveedores" title="Con quién se comparten">
        <p>Solo con los proveedores que hacen funcionar índice:</p>
        <LegalList>
          <li>
            <strong className="font-medium text-foreground">Neon</strong> (base de datos). Aquí se guardan tu cuenta y tus enlaces,
            en Frankfurt (Alemania). Tenemos con Neon un contrato de encargo de tratamiento (DPA). Empresa de EE. UU. que se
            acoge al Marco de Privacidad de Datos UE-EE. UU.
          </li>
          <li>
            <strong className="font-medium text-foreground">Vercel</strong> (alojamiento de la web). Tus peticiones pasan por sus
            servidores, que las atienden en Frankfurt (Alemania), y conserva registros técnicos durante poco tiempo. Vercel está
            certificada en el Marco de Privacidad de Datos UE-EE. UU. Mientras índice sea un proyecto gratuito y sin ánimo de
            lucro usamos su plan gratuito, que no incluye contrato de encargo: Vercel trata esos datos según sus propios{" "}
            <LegalLink href="https://vercel.com/legal/terms">términos</LegalLink> y su{" "}
            <LegalLink href="https://vercel.com/legal/privacy-policy">política de privacidad</LegalLink>. Si índice pasa a tener uso comercial,
            nos cambiaremos a un plan con contrato de encargo y actualizaremos esta política.
          </li>
          <li>
            <strong className="font-medium text-foreground">Google o GitHub</strong>, solo si eliges entrar con ellos: confirman
            tu identidad y nos dan tu correo y tu nombre.
          </li>
          <li>
            <strong className="font-medium text-foreground">Servicio de envío de correo</strong> para los códigos de acceso. Se
            indicará aquí antes de activarlo.
          </li>
        </LegalList>
        <p>
          Algunos servicios externos los consulta nuestro servidor, nunca tu navegador, y no reciben quién eres: Photon de
          komoot (Alemania) recibe lo que escribes al buscar tu ciudad; CARTO recibe la zona del mapa que se muestra; y cada web
          que guardas recibe la petición de su icono.
        </p>
      </LegalSection>

      <LegalSection label="cookies" title="Cookies y almacenamiento">
        <p>
          Solo usamos una cookie técnica para mantener tu sesión iniciada (30 días como máximo) y guardamos en tu navegador si
          prefieres el tema claro u oscuro. Son imprescindibles o los eliges tú, así que no necesitan consentimiento. No hay
          cookies de seguimiento ni de terceros.
        </p>
      </LegalSection>

      <LegalSection label="conservación" title="Cuánto tiempo los guardamos">
        <LegalList>
          <li>Tu cuenta y tus enlaces, mientras tengas la cuenta.</li>
          <li>Las sesiones, 30 días desde el último uso. Los códigos de acceso, 10 minutos.</li>
          <li>
            Si borras tu cuenta, todo se elimina al momento de la base de datos. Las copias de seguridad automáticas del
            proveedor se sobrescriben en un plazo máximo de 30 días.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection label="derechos" title="Tus derechos">
        <p>Desde Ajustes puedes, sin pedírselo a nadie:</p>
        <LegalList>
          <li>Ver y corregir tu nombre y tu ciudad (acceso y rectificación).</li>
          <li>Descargar todos tus datos en un archivo JSON (portabilidad).</li>
          <li>Borrar tu cuenta con todo lo asociado (supresión).</li>
        </LegalList>
        <p>
          Para oponerte a un tratamiento, pedir su limitación o cualquier otra duda, escribe a{" "}
          <LegalLink href={`mailto:${LEGAL.email}`}>{LEGAL.email}</LegalLink>; respondemos en menos de un mes. Si crees que no
          hemos atendido bien tu petición, puedes reclamar ante la{" "}
          <LegalLink href="https://www.aepd.es">Agencia Española de Protección de Datos</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection label="seguridad" title="Seguridad y edad mínima">
        <p>
          Las conexiones van cifradas, cada cuenta solo puede ver sus propios datos (también a nivel de base de datos) y no hay
          contraseñas que se puedan filtrar. Si hubiera una brecha de seguridad que afectara a tus datos, avisaríamos a la AEPD
          en 72 horas y a ti si hubiera un riesgo alto.
        </p>
        <p>Para usar índice necesitas tener 14 años o más.</p>
      </LegalSection>

      <LegalSection label="cambios" title="Cambios en esta política">
        <p>
          Si cambiamos algo importante, te lo diremos al entrar en índice antes de que se aplique. La fecha de arriba indica la
          versión vigente.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
