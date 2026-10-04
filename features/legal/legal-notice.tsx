import { LegalLink, LegalPage, LegalSection } from "@/components/ds/legal"
import { LEGAL } from "@/lib/legal"

export function LegalNotice() {
  return (
    <LegalPage
      title="Aviso legal"
      updated={LEGAL.updated}
      intro="Información sobre el titular de índice, como pide la Ley de Servicios de la Sociedad de la Información (LSSI-CE)."
    >
      <LegalSection label="titular" title="Titular">
        <p>
          {LEGAL.owner}, persona física. Contacto: <LegalLink href={`mailto:${LEGAL.email}`}>{LEGAL.email}</LegalLink>.
        </p>
        <p>índice es un proyecto personal y gratuito, sin actividad económica ni publicidad.</p>
      </LegalSection>

      <LegalSection label="propiedad" title="Propiedad intelectual">
        <p>
          El diseño, el código y los textos de índice son de su titular, salvo los componentes de código abierto que usa, que
          mantienen sus licencias. Los nombres, logotipos e iconos de otras webs que aparecen en tu índice pertenecen a sus
          dueños y solo se muestran para que reconozcas tus enlaces.
        </p>
        <p>
          El mapa usa datos de <LegalLink href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</LegalLink>{" "}
          y estilos de <LegalLink href="https://carto.com/attribution/">© CARTO</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection label="enlaces" title="Enlaces a otras webs">
        <p>
          Los enlaces que guardas llevan a webs de terceros. índice no controla su contenido ni responde de él. Si encuentras algo
          que no debería estar aquí, escríbenos.
        </p>
      </LegalSection>

      <LegalSection label="ley" title="Ley aplicable">
        <p>Este sitio se rige por la ley española.</p>
      </LegalSection>
    </LegalPage>
  )
}
