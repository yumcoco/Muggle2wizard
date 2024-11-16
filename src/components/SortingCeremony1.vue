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
            <p>{{ currentDialog }}</p>
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
              <div class="wizard-profile">
                <h2>{{ wizardName }}'s Wizard Profile</h2>
                <div class="profile-content">
                  <p>House: {{ wizardProfile.house }}</p>
                  <p>Wand: {{ wizardProfile.wand }}</p>
                  <p>Patronus: {{ wizardProfile.patronus }}</p>
                  <p>Signature Spell: {{ wizardProfile.spell }}</p>
                  <div class="mentor-message">
                    <h3>Mentor's Message</h3>
                    <p>{{ wizardProfile.mentorMessage }}</p>
                  </div>
                </div>
                <button @click="saveProfile" class="magical-button">Save Profile</button>
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
    const wizardName = ref('')

    // Audio related
    let bgMusic: HTMLAudioElement | null = null
    let sortingSound: HTMLAudioElement | null = null
    let spellSound: HTMLAudioElement | null = null

    onMounted(() => {
      bgMusic = new Audio('public/assets/hogwarts-theme.mp3')
      bgMusic.loop = true
      bgMusic.addEventListener('canplaythrough', () => {
        console.log('BGM is ready to play.')
      })
      bgMusic.addEventListener('error', (e) => {
        console.error('Failed to load BGM:', e)
      })
      bgMusic.play()

      sortingSound = new Audio('public/assets/sorting-sound.wav')
      spellSound = new Audio('public/assets/spell-sound.wav')

      function handleUserInteraction() {
        bgMusic?.play().catch((error) => {
          console.error('Failed to play BGM:', error)
        })
        document.removeEventListener('click', handleUserInteraction)
      }

      // 添加点击事件监听器
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
      if (step.value === 1 || step.value === 4) return 'sorting-hat'
      if (step.value === 5) return 'dumbledore'
      return 'dobby'
    })

    const currentDialog = computed(() => {
      const dialogs = [
        'Welcome to the magical world, dear Muggle! Please stand before the Sorting Hat and begin your magical journey!',
        'Tell me your name, future wizard. What is your personality like?',
        'Tell Dobby about your ideal ceremony scene! For example, "ancient forest" or "mystical lake."',
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
      return 'url(https://example.com/hogwarts-bg.jpg)'
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

    async function nextStep(): Promise<void> {
      if (step.value === 0) {
        bgMusic?.play()
      }
      if (step.value === 3) {
        await startSortingCeremony()
      } else {
        step.value++
        showDialog.value = false
        setTimeout(() => {
          showDialog.value = true
        }, 500)
      }
    }

    async function startSortingCeremony(): Promise<void> {
      step.value++
      // sortingSound?.play()
      if (bgMusic) {
        bgMusic.pause() // 暂停背景音乐
      }
      sortingSound?.play() // 播放分院帽音效

      // sortingSound?.addEventListener('ended', () => {
      //   if (bgMusic) {
      //     bgMusic.play() // 恢复背景音乐
      //   }
      // })
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

      const spellText = spell.split('')
      if (spellElement.value) {
        for (const char of spellText) {
          await new Promise((resolve) => setTimeout(resolve, 200))
          spellElement.value.textContent += char
        }
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

    return {
      step,
      showDialog,
      userData,
      wizardProfile,
      houses,
      spellElement,
      wizardName,
      currentTitle,
      currentSpeaker,
      currentDialog,
      backgroundStyle,
      generateWizardName,
      nextStep,
      saveProfile,
    }
  },
})
</script>

<!-- 样式代码如下 -->

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
  background-image: url('/dumbledore.png');
}

.floating-sorting-hat {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-image: url('/sorting-hat.png');
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
  font-family: 'Times New Roman', serif;
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
  background-image: url('/sorting-hat.png');
}

.character-avatar.dumbledore {
  background-image: url('/dumbledore.png');
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
  background-image: url('/sorting-hat.png');
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
  background-image: url('/magic-sparkles.png');
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

.house-banner.gryffindor {
  background-image: url('/gryffindor-banner.png');
}
.house-banner.hufflepuff {
  background-image: url('/hufflepuff-banner.png');
}
.house-banner.ravenclaw {
  background-image: url('/ravenclaw-banner.png');
}
.house-banner.slytherin {
  background-image: url('/slytherin-banner.png');
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
  text-align: left;
}

.profile-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 1rem;
  margin: 1rem 0;
}

.mentor-message {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
}

.wizard-name-reveal {
  background: rgba(255, 215, 0, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  text-align: center;
}

.wizard-name-reveal h3 {
  font-size: 1.5rem;
  color: #ffd700;
  margin-top: 0.5rem;
}

/* Animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes wobble {
  0%,
  100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
