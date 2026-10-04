import { LegalLink, LegalList, LegalPage, LegalSection } from "@/components/ds/legal"
import { LEGAL } from "@/lib/legal"

export function Terms() {
  return (
    <LegalPage
      title="Términos de uso"
      updated={LEGAL.updated}
      intro="Las reglas para usar índice. Están escritas para entenderse: si algo no queda claro, escríbenos."
    >
      <LegalSection label="servicio" title="Qué es índice">
        <p>
          índice es un servicio gratuito para guardar y ordenar tus enlaces, ofrecido por {LEGAL.owner}. Al crear tu cuenta
          aceptas estos términos y confirmas que tienes 14 años o más. Cómo tratamos tus datos se explica en la{" "}
          <LegalLink href="/privacidad">política de privacidad</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection label="cuenta" title="Tu cuenta y tus enlaces">
        <LegalList>
          <li>La cuenta es personal. Eres responsable de lo que se haga con ella y de mantener seguro tu correo.</li>
          <li>Tus enlaces son tuyos y privados: nadie más los ve. Puedes exportarlos o borrarlos cuando quieras.</li>
          <li>Puedes dejar de usar índice y borrar tu cuenta en cualquier momento desde Ajustes.</li>
        </LegalList>
      </LegalSection>

      <LegalSection label="uso" title="Uso aceptable">
        <p>No está permitido:</p>
        <LegalList>
          <li>Usar índice para actividades ilegales o para guardar enlaces a contenido ilegal.</li>
          <li>Intentar acceder a datos de otras personas, probar la seguridad sin permiso o saturar el servicio.</li>
          <li>Automatizar el uso de forma masiva o revender el servicio.</li>
        </LegalList>
        <p>
          Si alguien incumple estas reglas, podemos suspender o cerrar su cuenta. Salvo urgencia o mandato legal, avisaremos
          antes y daremos la opción de exportar los datos.
        </p>
      </LegalSection>

      <LegalSection label="garantías" title="Disponibilidad y responsabilidad">
        <p>
          índice se ofrece tal cual y sin garantía de disponibilidad continua. Hacemos lo posible por que funcione y por proteger
          tus datos, pero te recomendamos exportar tu índice de vez en cuando. No respondemos del contenido de las webs que
          guardas, que pertenecen a sus dueños.
        </p>
        <p>Nada de esto limita los derechos que te reconoce la ley como persona consumidora.</p>
      </LegalSection>

      <LegalSection label="cambios" title="Cambios y fin del servicio">
        <p>
          Si cambiamos estos términos de forma importante, te avisaremos al entrar antes de que se apliquen. Si algún día índice
          deja de funcionar, avisaremos con al menos 30 días para que puedas exportar tus datos.
        </p>
      </LegalSection>

      <LegalSection label="ley" title="Ley aplicable">
        <p>
          Estos términos se rigen por la ley española. Si hubiera un conflicto, serán competentes los juzgados de tu domicilio
          cuando actúes como persona consumidora. Antes de eso, escríbenos a{" "}
          <LegalLink href={`mailto:${LEGAL.email}`}>{LEGAL.email}</LegalLink> e intentaremos resolverlo.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
