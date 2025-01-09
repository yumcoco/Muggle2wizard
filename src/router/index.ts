import { createRouter, createWebHistory } from 'vue-router'
import CeremonyStart from '../views/CeremonyStart.vue'
import TheWelcome from '../components/TheWelcome.vue' // Make sure the path is correct.
import WizardName from '../components/WizardName.vue'
import SceneSelection from '../components/SceneSelection.vue'
import WishInput from '../components/WishInput.vue'
import GenerateContent from '../views/GenerateContent.vue'
import WizardProfile from '../components/WizardProfile.vue'

const routes = [
  { path: '/', component: TheWelcome }, // The root path is set to TheWelcome
  { path: '/ceremony-start', component: CeremonyStart },
  { path: '/wizard-name', component: WizardName },
  { path: '/scene-selection', component: SceneSelection },
  { path: '/wish-input', component: WishInput },
  { path: '/generate-content', component: GenerateContent },
  { path: '/wizard-profile', component: WizardProfile },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
