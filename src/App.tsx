import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Shell } from "./components/Chrome.tsx"
import { validateHandoff } from "./lib/logic.ts"
import { CarPage, EvolutionPage } from "./pages/CarPages.tsx"
import { BoothPage, CampaignPage, DemoPage, EnginePage, ExperiencesPage, MethodologyPage, MissingPage, StampPage } from "./pages/ExperiencePages.tsx"
import { RaceWeekendPage } from "./pages/RaceWeekend.tsx"
import { HomePage } from "./pages/Home.tsx"
import { ImpactPage } from "./pages/ImpactPages.tsx"
import { MatchPage, PeoplePage, PersonaPage } from "./pages/PeoplePages.tsx"
import { BusinessPage, PartnerGaps, PartnerHome, PartnerInclusion, PartnerProgrammes, PartnerReport, PartnerSimulate } from "./pages/PartnerPages.tsx"
import { SimulatePage } from "./pages/Scenario.tsx"

if (import.meta.env.DEV) {
  const errors = validateHandoff()
  if (errors.length) console.error(errors)
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/car/evolution" element={<EvolutionPage />} />
          <Route path="/car/:componentId" element={<CarPage />} />
          <Route path="/car" element={<CarPage />} />
          <Route path="/people/:personaId" element={<PersonaPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/race" element={<RaceWeekendPage />} />
          <Route path="/simulate" element={<SimulatePage />} />
          <Route path="/partners/programmes" element={<PartnerProgrammes />} />
          <Route path="/partners/simulate" element={<PartnerSimulate />} />
          <Route path="/partners/reports" element={<PartnerReport />} />
          <Route path="/partners/gaps" element={<PartnerGaps />} />
          <Route path="/partners/inclusion" element={<PartnerInclusion />} />
          <Route path="/partners/business-case" element={<BusinessPage />} />
          <Route path="/partners" element={<PartnerHome />} />
          <Route path="/engine" element={<EnginePage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/booth" element={<BoothPage />} />
          <Route path="/stamp/:code" element={<StampPage />} />
          <Route path="/go/:campaignId" element={<CampaignPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="*" element={<MissingPage />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}
