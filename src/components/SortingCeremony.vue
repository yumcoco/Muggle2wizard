<template>
  <div class="sorting-ceremony" :class="{ dark: true }">
    <!-- Magical Background -->
    <div class="magical-background" :style="backgroundStyle">
      <div class="overlay"></div>
    </div>

    <!-- Floating Characters -->
    <div class="floating-characters">
      <div class="floating-owl" :class="{ 'animate-owl': step > 0 }"></div>
      <div class="floating-dumbledore" :class="{ show: step > 3 }"></div>
      <div class="floating-sorting-hat" :class="{ show: step > 1 && step < 5 }"></div>
    </div>

    <!-- Main Content Card -->
    <div class="ceremony-container">
      <div class="ceremony-card" :class="{ show: true }">
        <!-- Header -->
        <h1 class="ceremony-title">
          {{ step === 0 ? 'Hogwarts Sorting Ceremony' : currentTitle }}
        </h1>

        <!-- Character Dialog -->
        <div class="character-dialog" :class="{ show: showDialog }">
          <div class="character-avatar" :class="currentSpeaker"></div>
          <div class="dialog-bubble">
            <p ref="dialogText"></p>
          </div>
        </div>

        <!-- Form Content -->
        <div class="ceremony-content">
          <TransitionGroup name="fade">
            <!-- Step 1: Welcome -->
            <div v-if="step === 0" key="welcome" class="ceremony-step">
              <button @click="nextStep" class="magical-button">Start Ceremony</button>
            </div>

            <!-- Step 2: Name & MBTI -->
            <div v-if="step === 1" key="personal-info" class="ceremony-step">
              <input
                v-model="userData.name"
                placeholder="Your name"
                class="magical-input"
                @input="generateWizardName"
              />
              <div v-if="wizardName" class="wizard-name-reveal">
                <p>Your wizard name is:</p>
                <h3>{{ wizardName }}</h3>
              </div>
              <input v-model="userData.mbti" placeholder="Your MBTI type" class="magical-input" />
              <button @click="nextStep" class="magical-button">Next</button>
            </div>

            <!-- Step 3: Ceremony Scene -->
            <div v-if="step === 2" key="scene" class="ceremony-step">
              <input
                v-model="userData.scene"
                placeholder="Describe your ideal ceremony scene"
                class="magical-input"
              />
              <button @click="nextStep" class="magical-button">Generate Scene</button>
            </div>

            <!-- Step 4: Wizard Wish -->
            <div v-if="step === 3" key="wish" class="ceremony-step">
              <input v-model="userData.wish" placeholder="State your wish" class="magical-input" />
              <button @click="nextStep" class="magical-button">Make a Wish</button>
            </div>

            <!-- Step 5: Sorting Ceremony -->
            <div v-if="step === 4" key="sorting" class="ceremony-step sorting-animation">
              <div class="sorting-hat-container">
                <div class="sorting-hat"></div>
                <div class="magic-sparkles"></div>
              </div>
              <div class="house-banners">
                <div
                  v-for="house in houses"
                  :key="house"
                  :class="['house-banner', house.toLowerCase()]"
                ></div>
              </div>
              <div class="spell-container">
                <p class="spell" ref="spellElement"></p>
              </div>
            </div>

            <!-- Step 6: Result -->
            <div v-if="step === 5" key="result" class="ceremony-step result">
              <div
                class="wizard-profile"
                :class="wizardProfile.house.toLowerCase()"
                :style="{ backgroundImage: `url(${houseBackgroundImage})` }"
              >
                <div class="profile-header">
                  <!-- Dynamic Title Color -->
                  <h2 class="wizard-profile-title" :style="{ color: houseThemeColor }">
                    {{ wizardProfile.house }} HOUSE
                  </h2>
                </div>

                <div class="profile-content">
                  <div class="house-crest"></div>

                  <div class="profile-details">
                    <div class="detail-row">
                      <label>NAME:</label>
                      <span>{{ wizardName }}</span>
                    </div>

                    <div class="detail-row">
                      <label>WAND:</label>
                      <span>{{ wizardProfile.wand }}</span>
                    </div>

                    <div class="detail-row">
                      <label>PATRONUS:</label>
                      <span>{{ wizardProfile.patronus }}</span>
                    </div>

                    <div class="detail-row">
                      <label>SIGNATURE SPELL:</label>
                      <span>{{ wizardProfile.spell }}</span>
                    </div>

                    <div class="mentor-message">
                      <h3>MENTOR'S MESSAGE:</h3>
                      <p>{{ wizardProfile.mentorMessage }}</p>
                    </div>

                    <div class="signature-line">
                      <div class="seal"></div>
                      <div class="line"></div>
                    </div>
                  </div>
                </div>

                <button @click="saveProfile" class="magical-button">Save Certificate</button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import type { UserData, WizardProfile, House } from '@types'
import { houses } from '@/types'
import axios from 'axios';

export default defineComponent({
  name: 'SortingCeremony',
  setup() {
    const step = ref(0)
    const showDialog = ref(true)
    const userData = ref<UserData>({
      name: '',
      mbti: '',
      scene: '',
      wish: '',
    })
    const wizardProfile = ref<WizardProfile>({
      house: '',
      wand: '',
      patronus: '',
      spell: '',
      mentorMessage: '',
    })
    const spellElement = ref<HTMLParagraphElement | null>(null)
    const dialogText = ref<HTMLParagraphElement | null>(null)
    const wizardName = ref('')

    // Dynamic theme color based on house
    const houseThemeColor = computed(() => {
      if (!wizardProfile.value.house) return '#ffffff' // Default color
      return wizardProfile.value.house.toLowerCase() === 'gryffindor'
        ? '#740001'
        : wizardProfile.value.house.toLowerCase() === 'hufflepuff'
          ? '#372e29'
          : wizardProfile.value.house.toLowerCase() === 'ravenclaw'
            ? '#000a90'
            : '#1a472a' // Slytherin
    })

    const houseBackgroundImage = computed(() => {
      const house = wizardProfile.value.house.toLowerCase()
      return house === 'gryffindor'
        ? '/assets/Gryffindorbg.png'
        : house === 'hufflepuff'
          ? '/assets/Hufflepuffbg.png'
          : house === 'ravenclaw'
            ? '/assets/Ravenclawbg.png'
            : '/assets/Slytherinbg.png' // 默认 Slytherin
    })

    // Audio related
    let bgMusic: HTMLAudioElement | null = null
    let sortingSound: HTMLAudioElement | null = null
    let spellSound: HTMLAudioElement | null = null
    let typingSound: HTMLAudioElement | null = null

    onMounted(async () => {
      bgMusic = new Audio('/assets/hogwarts-theme.mp3')
      bgMusic.loop = true
      if (dialogText.value && step.value === 0) {
        await typeText(currentDialog.value, dialogText.value)
      }

      sortingSound = new Audio('/assets/sorting-sound.wav')
      spellSound = new Audio('/assets/spell-sound.wav')
      typingSound = new Audio('/assets/typing-sound.mp3')
      typingSound.loop = true

      function handleUserInteraction() {
        bgMusic?.play().catch((error) => {
          console.error('Failed to play BGM:', error)
        })
        document.removeEventListener('click', handleUserInteraction)
      }

      document.addEventListener('click', handleUserInteraction)
    })

    const currentTitle = computed(() => {
      const titles = [
        'Hogwarts Sorting Ceremony',
        'Identity Confirmation',
        'Scene Selection',
        'Wizard Wish',
        'Sorting Ceremony',
        'Wizard Profile',
      ]
      return titles[step.value]
    })

    const currentSpeaker = computed(() => {
      if (step.value >= 1) return 'sorting-hat'
      return 'dobby'
    })

    const currentDialog = computed(() => {
      const dialogs = [
        'Welcome to the magical world, dear Muggle! Please stand before the Sorting Hat and begin your magical journey!',
        'Tell me your name, future wizard. What is your personality like?',
        'Tell me about your ideal ceremony scene! For example, "ancient forest" or "mystical lake."',
        'Every wizard has a wish deep inside. Tell me yours.',
        'Let’s see which house you belong to...',
        'Congratulations on becoming a real wizard!',
      ]
      return dialogs[step.value]
    })

    const backgroundStyle = computed(() => ({
      backgroundImage: `url(${getBackgroundImage()})`,
    }))

    function getBackgroundImage(): string {
      if (step.value >= 2 && userData.value.scene) {
        return `url(/generated-scene-${userData.value.scene}.jpg)`
      }
      return 'public/assets/hogwarts-background.jpg'
    }

    function generateWizardName(): void {
      if (userData.value.name) {
        const prefixes = ['Albus', 'Minerva', 'Severus', 'Luna', 'Neville', 'Hermione']
        const suffixes = ['Dumbledore', 'McGonagall', 'Snape', 'Lovegood', 'Longbottom', 'Granger']
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)]
        wizardName.value = `${randomPrefix} ${randomSuffix}`
      } else {
        wizardName.value = ''
      }
    }

    async function typeText(text: string, element: HTMLElement): Promise<void> {
      element.textContent = '' // 清空现有内容
      for (const char of text) {
        element.textContent += char // 逐字追加字符
        await new Promise((resolve) => setTimeout(resolve, 50)) // 每个字间隔 50ms
      }
    }

    async function nextStep(): Promise<void> {
      if (step.value === 0) {
        bgMusic?.play()
      }
      if (step.value === 3) {
        await startSortingCeremony()
      } else {
        step.value++
        showDialog.value = false
        await new Promise((resolve) => setTimeout(resolve, 500))
        showDialog.value = true
        if (dialogText.value) {
          await typeText(currentDialog.value, dialogText.value)
        }
      }
    }

    async function startSortingCeremony(): Promise<void> {
      step.value++
      if (bgMusic) {
        bgMusic.pause()
      }
      sortingSound?.play()

      await new Promise((resolve) => setTimeout(resolve, 5000))

      const randomHouse = houses[Math.floor(Math.random() * houses.length)]
      const spell = generateSpell()

      wizardProfile.value = {
        house: randomHouse,
        wand: generateWand(),
        patronus: generatePatronus(),
        spell: spell,
        mentorMessage: getHouseMentorMessage(randomHouse),
      }
      await revealHouseAndSpell(randomHouse, spell)
    }

    function generateSpell(): string {
      const prefixes = ['Lumi', 'Arca', 'Volo', 'Tempus', 'Vita']
      const suffixes = ['nox', 'canto', 'mentis', 'magica', 'eternum']
      return (
        prefixes[Math.floor(Math.random() * prefixes.length)] +
        suffixes[Math.floor(Math.random() * suffixes.length)]
      )
    }

    function generateWand(): string {
      const woods = ['Oak', 'Holly', 'Hawthorn', 'Elm']
      const cores = ['Phoenix Feather', 'Unicorn Hair', 'Dragon Heartstring']
      const lengths = [9, 10, 11, 12, 13, 14]

      return (
        `${woods[Math.floor(Math.random() * woods.length)]}, ` +
        `${cores[Math.floor(Math.random() * cores.length)]}, ` +
        `${lengths[Math.floor(Math.random() * lengths.length)]} inches`
      )
    }

    function generatePatronus(): string {
      const patronuses = ['Stag', 'Otter', 'Phoenix', 'Unicorn', 'Wolf', 'Cat']
      return patronuses[Math.floor(Math.random() * patronuses.length)]
    }

    function getHouseMentorMessage(house: House): string {
      const messages: Record<House, string> = {
        Gryffindor:
          'A brave heart can light up the darkest night. May your strength bring hope to your friends.',
        Hufflepuff:
          'Gentleness and patience are your sources of strength. May your kindness be your greatest magic.',
        Ravenclaw: 'The desire for wisdom and exploration will guide you. Knowledge is true magic.',
        Slytherin: 'Only true determination and belief can control your destiny.',
      }
      return messages[house]
    }

    async function revealHouseAndSpell(house: House, spell: string): Promise<void> {
      const houseElement = document.querySelector(
        `.house-banner.${house.toLowerCase()}`,
      ) as HTMLElement | null
      if (houseElement) {
        houseElement.classList.add('revealed')
      } else {
        console.warn('House element not found:', house)
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      spellSound?.play()

      if (spellElement.value) {
        await typeText(spell, spellElement.value)
      } else {
        console.warn('Spell element not found')
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      step.value++
    }








    async function saveProfile(): Promise<void> {
      const profileText = `
      Wizard Profile
      Name: ${wizardName.value}
      House: ${wizardProfile.value.house}
      Wand: ${wizardProfile.value.wand}
      Patronus: ${wizardProfile.value.patronus}
      Signature Spell: ${wizardProfile.value.spell}
      Mentor's Message: ${wizardProfile.value.mentorMessage}
            `.trim()

      const blob = new Blob([profileText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'wizard-profile.txt'
      a.click()
      URL.revokeObjectURL(url)

      const speech = new SpeechSynthesisUtterance(profileText)
      speech.lang = 'en-US'
      speechSynthesis.speak(speech)
    }

    async function postProfile(data: string): Promise<void> {
      const profileText = `
        Wizard Profile
        Name: ${wizardName.value}
        House: ${wizardProfile.value.house}
        Wand: ${wizardProfile.value.wand}
        Patronus: ${wizardProfile.value.patronus}
        Signature Spell: ${wizardProfile.value.spell}
        Mentor's Message: ${wizardProfile.value.mentorMessage}
      `.trim();

      console.log(data);
      // ####写入后端post
      const url = 'https://example.com/api/profiles';

      try {
        const response = await axios.post(url, {
          profileText: profileText,
          extraData: data,
        });

        console.log('Profile posted successfully:', response.data);
      } catch (error) {
        console.error('Error posting profile:', error);
      }
    }

    return {
      step,
      showDialog,
      userData,
      wizardProfile,
      houses,
      spellElement,
      dialogText,
      wizardName,
      houseThemeColor,
      houseBackgroundImage,
      currentTitle,
      currentSpeaker,
      currentDialog,
      backgroundStyle,
      generateWizardName,
      nextStep,
      saveProfile,
      postProfile,
    }
  },
})
</script>

<!-- WEB UX -->
<style scoped>
.sorting-ceremony {
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  overflow: hidden;
}

.magical-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: -1;
  transition: background-image 1s ease-in-out;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.floating-characters {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-owl,
.floating-dumbledore,
.floating-sorting-hat {
  position: absolute;
  width: 100px;
  height: 100px;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.floating-owl {
  top: 2rem;
  right: 2rem;
  background-image: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/owl-9dtM8Cgp1SxngTU8YX3E21gJks53TA.png');
}

.floating-dumbledore {
  bottom: 2rem;
  left: 2rem;
  background-image: url('public/assets/dobby-avatar.png');
}

.floating-sorting-hat {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-image: url('public/assets/sorting-hat.png');
}

.animate-owl {
  animation: float 3s ease-in-out infinite;
  opacity: 1;
}

.show {
  opacity: 1;
}

.ceremony-container {
  width: 90%;
  max-width: 800px;
  margin: 2rem;
  perspective: 1000px;
}

.ceremony-card {
  background: rgba(25, 25, 35, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
  transform-style: preserve-3d;
  transform: translateY(50px);
  opacity: 0;
  transition: all 0.5s ease-out;
}

.ceremony-card.show {
  transform: translateY(0);
  opacity: 1;
}

.ceremony-title {
  font-size: 2.5rem;
  text-align: center;
  color: #ffd700;
  margin-bottom: 2rem;
  font-family: 'Cinzel', serif;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.character-dialog {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease-out;
}

.character-dialog.show {
  opacity: 1;
  transform: translateY(0);
}

.character-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-size: contain;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.character-avatar.dobby {
  background-image: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dobby.png-5QU7NyrI54xwjAihisZP9ZEuQ70g5L.webp');
}

.character-avatar.sorting-hat {
  background-image: url('public/assets/sorting-hat.png');
}

.character-avatar.dumbledore {
  background-image: url('public/assets/dobby-avatar.png');
}

.dialog-bubble {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 1rem;
  position: relative;
  flex-grow: 1;
}

.dialog-bubble::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 20px;
  border-style: solid;
  border-width: 10px 10px 10px 0;
  border-color: transparent rgba(255, 255, 255, 0.1) transparent transparent;
}

.ceremony-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.magical-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.magical-input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.magical-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  color: #000;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Cinzel', serif;
}

.magical-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

.sorting-animation {
  position: relative;
  height: 300px;
}

.sorting-hat-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.sorting-hat {
  width: 150px;
  height: 150px;
  background-image: url('public/assets/sorting-hat.png');
  background-size: contain;
  background-repeat: no-repeat;
  animation: wobble 2s ease-in-out infinite;
}

.magic-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('public/assets/magic-sparkles.png');
  background-size: 100% 100%;
  opacity: 0;
  animation: sparkle 3s ease-in-out infinite;
}

.house-banners {
  display: flex;
  justify-content: space-around;
  width: 100%;
  position: absolute;
  bottom: 20px;
}

.house-banner {
  width: 60px;
  height: 80px;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.3;
  transition: all 0.5s ease;
}
.wizard-profile-title {
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin: 0;
  transition: color 0.3s ease-in-out;
  padding-top: 180px;
}

.house-banner.gryffindor {
  background-image: url('public/assets/Gryffindor.png');
}
.house-banner.hufflepuff {
  background-image: url('public/assets/Hufflepuff.png');
}
.house-banner.ravenclaw {
  background-image: url('public/assets/Ravenclaw.png');
}
.house-banner.slytherin {
  background-image: url('public/assets/Slytherin.png');
}

.house-banner.revealed {
  opacity: 1;
  transform: scale(1.2);
}

.spell-container {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.wizard-profile {
  width: 100%;
  max-width: 1024px;
  aspect-ratio: 1.4/1;

  background-size: cover;
  padding: 2rem;
  border-radius: 1rem;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  font-family: 'Cinzel', serif;
}

.wizard-profile::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2rem solid transparent;
  border-image: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/certificate-border-red-K0rXXI8j0d3GvpQfLvkK4GzpXtWxpR.png')
    30 stretch;
  pointer-events: none;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-header h2 {
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin: 0;
}

.profile-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  padding: 0 1rem;
}

.house-crest {
  width: 100px;
  height: 100px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  padding-top: 10px;
}

.gryffindor .house-crest {
  background-image: url('public/assets/user.png');
}

.hufflepuff .house-crest {
  background-image: url('public/assets/user.png');
}

.ravenclaw .house-crest {
  background-image: url('public/assets/user.png');
}

.slytherin .house-crest {
  background-image: url('public/assets/user.png');
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0.01rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row label {
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.detail-row span {
  font-size: 1.2rem;
  color: #111;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  padding-bottom: 0.5rem;
}

.mentor-message {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid rgba(0, 0, 0, 0.1);
}

.mentor-message h3 {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.mentor-message p {
  font-style: italic;
  color: #111;
  line-height: 1.6;
}

.signature-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.seal {
  width: 90px;
  height: 90px;
  background: url('public/assets/seal.png') no-repeat center center;
  background-size: contain;
}

.line {
  flex-grow: 1;
  height: 1px;
  background: rgba(0, 0, 0, 0.3);
}

/* House-specific colors */
.gryffindor {
  --house-color: #740001;
}
.hufflepuff {
  --house-color: #372e29;
}
.ravenclaw {
  --house-color: #000a90;
}
.slytherin {
  --house-color: #1a472a;
}

.magical-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  color: #000;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
