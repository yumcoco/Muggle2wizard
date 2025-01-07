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
      <div class="floating-sorting-hat" :class="{ show: step > 1 && step < 9 }"></div>
    </div>

    <!-- Main Content Card -->
    <div class="ceremony-container">
      <div class="ceremony-card" :class="{ show: true }">
        <!-- Header -->
        <h1 class="ceremony-title">
          {{ step === 0 ? 'Muggle Transformer' : currentTitle }}
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
            <!-- Step 0: Welcome -->
            <div v-if="step === 0" key="welcome" class="ceremony-step">
              <button @click="nextStep" class="magical-button">Start Ceremony</button>
            </div>

            <!-- Step 1: Name & MBTI -->
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
              <input
                v-model="userData.gender"
                placeholder="Your Gender (female or male)"
                class="magical-input"
              />
              <button @click="nextStep" class="magical-button">Next</button>
            </div>

            <!-- Step 2: Ceremony Scene -->
            <div v-if="step === 2" key="scene" class="ceremony-step">
              <input
                v-model="userData.scene"
                placeholder="Describe your ideal ceremony scene"
                class="magical-input"
              />
              <button @click="nextStep" class="magical-button">Generate Scene</button>
            </div>

            <!-- Step 3: Wizard Wish -->
            <div v-if="step === 3" key="wish" class="ceremony-step">
              <input v-model="userData.wish" placeholder="State your wish" class="magical-input" />
              <button @click="nextStep" class="magical-button">Make a Wish</button>
            </div>

            <!--
              =======================================================================
              NEWLY ADDED GAME STEPS
              =======================================================================
            -->

            <!-- Step 4: Spell Knowledge Quiz (2 Questions) -->
            <div v-if="step === 4" key="quiz-spell-knowledge" class="ceremony-step quiz-step">
              <h2>Spell Knowledge Quiz</h2>
              <div
                v-for="(question, index) in spellQuestions"
                :key="'spell-' + index"
                class="quiz-question"
              >
                <p>{{ question.question }}</p>
                <div class="quiz-options">
                  <label v-for="option in question.options" :key="option" class="quiz-option">
                    <input
                      type="radio"
                      :name="'spell-question-' + index"
                      :value="option"
                      v-model="spellAnswers[index]"
                    />
                    {{ option }}
                  </label>
                </div>
              </div>
              <button @click="submitSpellQuiz" class="magical-button">Submit Spell Quiz</button>
            </div>

            <!-- Step 5: Potion Knowledge Quiz (3 Questions) -->
            <div v-if="step === 5" key="quiz-potion-knowledge" class="ceremony-step quiz-step">
              <h2>Potion Knowledge Quiz</h2>
              <div
                v-for="(question, index) in potionQuestions"
                :key="'potion-' + index"
                class="quiz-question"
              >
                <p>{{ question.question }}</p>
                <div class="quiz-options">
                  <label v-for="option in question.options" :key="option" class="quiz-option">
                    <input
                      type="radio"
                      :name="'potion-question-' + index"
                      :value="option"
                      v-model="potionAnswers[index]"
                    />
                    {{ option }}
                  </label>
                </div>
              </div>
              <button @click="submitPotionQuiz" class="magical-button">Submit Potion Quiz</button>
            </div>

            <!-- Step 6: Magic Knowledge Quiz (5 Questions) -->
            <div v-if="step === 6" key="quiz-magic-knowledge" class="ceremony-step quiz-step">
              <h2>Magic Knowledge Quiz</h2>
              <div
                v-for="(question, index) in magicQuestions"
                :key="'magic-' + index"
                class="quiz-question"
              >
                <p>{{ question.question }}</p>
                <div class="quiz-options">
                  <label v-for="option in question.options" :key="option" class="quiz-option">
                    <input
                      type="radio"
                      :name="'magic-question-' + index"
                      :value="option"
                      v-model="magicAnswers[index]"
                    />
                    {{ option }}
                  </label>
                </div>
              </div>
              <button @click="submitMagicQuiz" class="magical-button">Submit Magic Quiz</button>
            </div>

            <!-- Step 7: Lucky Dice Game -->
            <div v-if="step === 7" key="lucky-dice-game" class="ceremony-step">
              <h2>Lucky Dice Game</h2>
              <p>Click to roll a magical dice and add a random score between -50 and +50!</p>
              <!-- 1. Only roll once -->
              <button @click="rollDice" class="magical-button" :disabled="diceRolled">
                Roll Dice
              </button>
              <p v-if="diceResult !== null">You rolled: {{ diceResult }}</p>
              <button
                v-if="diceResult !== null"
                @click="finishDiceGame"
                class="magical-button"
              >
                Next
              </button>
            </div>

            <!-- Step 8: Game Result -->
            <div v-if="step === 8" key="game-result" class="ceremony-step">
              <h2>Game Over</h2>
              <p>Your total score is: {{ totalScore }}</p>
              <!--grade of reward-->>
              <div v-if="totalScore >= 0">
                <p>Congratulations! You have unlocked a special avatar and 8-bit background music!Please wait at least 1min to generate...</p>
                <!-- Example placeholder for the custom avatar image -->
                <!-- <img
                  src="https://via.placeholder.com/150x150?text=Custom+Avatar"
                  alt="Custom Avatar"
                  style="border: 2px solid #ffd700; border-radius: 50%;"
                /> -->
                <img
                  v-if="pixelWizardImageUrl"
                  :src="pixelWizardImageUrl"
                  alt="Reward Avatar"
                  style="border: 2px solid #ffd700; border-radius: 50%; max-width: 200px;"
                />
                <!-- Example placeholder for background music or 8-bit track (pseudo UI) -->
                <p>8-bit track: <em>Playing your special reward music...</em></p>
              </div>
              <div v-else>
                <p>Sorry, you did not earn the special reward this time.</p>
              </div>
              <!-- 2. Click Sorting Ceremony to automatically assign the college and display the profile. -->
              <button @click="goToSortingCeremony" class="magical-button">
                Sorting Ceremony
              </button>
            </div>

            <!--
              =======================================================================
              ORIGINAL SORTING CEREMONY STEPS (Renamed to Steps 9 & 10)
              =======================================================================
            -->

            <!-- Step 9: Sorting Ceremony -->
            <div v-if="step === 9" key="sorting" class="ceremony-step sorting-animation">
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

            <!-- Step 10: Result (Wizard Profile) -->
            <div v-if="step === 10" key="result" class="ceremony-step result">

              <div class="container" ref="imageDom">
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
                    <!--div class="house-crest"></div-->
                    <div class="house-crest">
                      <img
                          :src="avatarUrl"
                          :alt="userData.gender === 'male' ? 'Male Wizard Avatar' : 'Female Wizard Avatar'"
                          style="margin-top: -5px; max-width: 100px; border: 2px solid #ffd700; border-radius: 5%;"
                        />
                    </div>

                    <div class="profile-details">
                      <div class="detail-row">
                        <label>NAME:</label>
                        <span>{{ wizardName }}({{userData.name }})</span>
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
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * Main SortingCeremony component
 * This component contains:
 * 1. Basic user input flow (step 0 ~ step 3)
 * 2. Newly added Wizard Quiz game (step 4 ~ step 8)
 * 3. Sorting Ceremony (step 9)
 * 4. Wizard Profile (step 10)
 */

import { defineComponent, ref, computed, onMounted } from 'vue'
import type { UserData, WizardProfile, House } from '@types'
import { houses } from '@/types'
import axios from 'axios';
import { useHuggingFace } from '@/composables/useHuggingFace'
import html2canvas from 'html2canvas';

export default defineComponent({
  name: 'SortingCeremony',
  setup() {
    // ==========================
    // Step reference
    // ==========================
    /**
     * step:
     *  0 -> Welcome
     *  1 -> Name & MBTI
     *  2 -> Ceremony Scene
     *  3 -> Wizard Wish
     *  4 -> Spell Knowledge Quiz
     *  5 -> Potion Knowledge Quiz
     *  6 -> Magic Knowledge Quiz
     *  7 -> Lucky Dice Game
     *  8 -> Game Result
     *  9 -> Sorting Ceremony
     *  10-> Wizard Profile
     */
    const step = ref(0)
    const showDialog = ref(true)

    // ==========================
    // User data
    // ==========================
    const userData = ref<UserData>({
      name: '',
      mbti: '',
      gender: '',
      scene: '',
      wish: '',
    })

    const maleAvatarUrl = 'public/assets/user1.png';
    const femaleAvatarUrl = 'public/assets/user.png';

    // ==========================
    // Wizard Profile data
    // ==========================
    const wizardProfile = ref<WizardProfile>({
      house: '',
      wand: '',
      patronus: '',
      spell: '',
      mentorMessage: '',
    })

    const wizardName = ref('')

    // ==========================
    // Audio elements
    // ==========================
    let bgMusic: HTMLAudioElement | null = null
    let sortingSound: HTMLAudioElement | null = null
    let spellSound: HTMLAudioElement | null = null
    let typingSound: HTMLAudioElement | null = null

    // ==========================
    // Refs to DOM elements
    // ==========================
    const spellElement = ref<HTMLParagraphElement | null>(null)
    const dialogText = ref<HTMLParagraphElement | null>(null)

    // ==========================
    // House theme color
    // ==========================
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

    // ==========================
    // House background image
    // ==========================
    const houseBackgroundImage = computed(() => {
      const house = wizardProfile.value.house.toLowerCase()
      return house === 'gryffindor'
        ? '/assets/Gryffindorbg.png'
        : house === 'hufflepuff'
          ? '/assets/Hufflepuffbg.png'
          : house === 'ravenclaw'
            ? '/assets/Ravenclawbg.png'
            : '/assets/Slytherinbg.png' // default Slytherin
    })

    // ==========================
    // onMounted Hook
    // ==========================
    onMounted(async () => {
      bgMusic = new Audio('/assets/hogwarts-theme.mp3')
      bgMusic.loop = true

      if (dialogText.value && step.value === 0) {
        // Type out the welcome text
        await typeText(currentDialog.value, dialogText.value)
      }

      sortingSound = new Audio('/assets/sorting-sound.wav')
      spellSound = new Audio('/assets/spell-sound.wav')
      typingSound = new Audio('/assets/typing-sound.mp3')
      typingSound.loop = true

      // Auto-play workaround
      function handleUserInteraction() {
        bgMusic?.play().catch((error) => {
          console.error('Failed to play BGM:', error)
        })
        document.removeEventListener('click', handleUserInteraction)
      }

      document.addEventListener('click', handleUserInteraction)
    })

    // ==========================
    // Step titles
    // ==========================
    const currentTitle = computed(() => {
      const titles = [
        'Muggle Transformer',         // step 0
        'Identity Confirmation',      // step 1
        'Scene Selection',            // step 2
        'Wizard Wish',                // step 3
        'Spell Knowledge Quiz',       // step 4 (new)
        'Potion Knowledge Quiz',      // step 5 (new)
        'Magic Knowledge Quiz',       // step 6 (new)
        'Lucky Dice Game',            // step 7 (new)
        'Game Result',                // step 8 (new)
        'Sorting Ceremony',           // step 9
        'Wizard Profile',             // step 10
      ]
      return titles[step.value]
    })

    // ==========================
    // Current speaker for avatar
    // ==========================
    const currentSpeaker = computed(() => {
      // Use Sorting Hat for steps >=1 and <9
      // Use Dobby for the first step
      if (step.value >= 1 && step.value < 9) return 'sorting-hat'
      if (step.value >= 9) return 'dumbledore'
      return 'dobby'
    })

    // ==========================
    // Current dialog
    // ==========================
    const currentDialog = computed(() => {
      const dialogs = [
        // step 0
        'Welcome to the magical world, dear Muggle! Please stand before the Sorting Hat and begin your magical journey!',
        // step 1
        'Tell me your name, future wizard. What is your personality like?',
        // step 2
        'Tell me about your ideal ceremony scene! For example, "ancient forest" or "mystical lake."',
        // step 3
        'Every wizard has a wish deep inside. Tell me yours.',
        // step 4
        'Let’s test your Spell Knowledge! Answer carefully.',
        // step 5
        'Now, let’s see your knowledge about Potions!',
        // step 6
        'Next, we’ll check your general Magic Knowledge.',
        // step 7
        'Time for a Lucky Dice roll! This can add or subtract up to 50 points!',
        // step 8
        'Your quiz journey ends here. Let’s see your total score!',
        // step 9
        'Let’s see which house you belong to...',
        // step 10
        'Congratulations on becoming a real wizard!',
      ]
      return dialogs[step.value]
    })

    // ==========================
    // Background style (scene)
    // ==========================
    const backgroundStyle = computed(() => ({
      backgroundImage: `url(${getBackgroundImage()})`,
    }))

    function getBackgroundImage(): string {
      if (step.value >= 2 && userData.value.scene) {
        // Just a placeholder logic for "generated scene"
        return `url(/generated-scene-${userData.value.scene}.jpg)`
      }
      return 'public/assets/hogwarts-background.jpg'
    }

    // ==========================
    // Generate wizard name
    // ==========================
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

    // ==========================
    // Type text effect
    // ==========================
    async function typeText(text: string, element: HTMLElement): Promise<void> {
      element.textContent = ''
      for (const char of text) {
        element.textContent += char
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    }

    // ==========================
    // Next step navigation
    // ==========================
    async function nextStep(): Promise<void> {
      // Start background music if moving from step 0
      if (step.value === 0) {
        bgMusic?.play()
      }

      // If user clicks "Generate Scene" (step 2) or "Make a Wish" (step 3) or "Next" from name input,
      // just move to the next step
      if (step.value < 8 && ![3].includes(step.value)) {
        step.value++
        showDialog.value = false
        await new Promise((resolve) => setTimeout(resolve, 500))
        showDialog.value = true
        if (dialogText.value) {
          await typeText(currentDialog.value, dialogText.value)
        }
        return
      }

      // If user is about to initiate quiz from step 3 => jump to step 4
      if (step.value === 3) {
        step.value = 4
        showDialog.value = false
        await new Promise((resolve) => setTimeout(resolve, 500))
        showDialog.value = true
        if (dialogText.value) {
          await typeText(currentDialog.value, dialogText.value)
        }
        return
      }

      // If user is at step >= 8, we won't handle it here (we have separate function for sorting)
    }

    /**
     * 2. When clicking "Sorting Ceremony", go directly to step=9 and automatically trigger the college allocation
     */
    async function goToSortingCeremony() {
      // Transition from step 8 -> step 9
      step.value = 9
      showDialog.value = false
      await new Promise((resolve) => setTimeout(resolve, 500))
      showDialog.value = true

      // Type out sorting ceremony text
      if (dialogText.value) {
        await typeText(currentDialog.value, dialogText.value)
      }

      // 自动执行 Sorting Ceremony
      await startSortingCeremony()
    }

    // ==========================
    // Sorting ceremony flow
    // ==========================
    async function startSortingCeremony(): Promise<void> {
      // Step 9 is sorting animation
      // Pause BGM, play sorting sound
      if (bgMusic) {
        bgMusic.pause()
      }
      sortingSound?.play()

      // Delay for the sorting animation
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Randomly assign a house
      const randomHouse = houses[Math.floor(Math.random() * houses.length)]
      const spell = generateSpell()

      wizardProfile.value = {
        house: randomHouse,
        wand: generateWand(),
        patronus: generatePatronus(),
        spell: spell,
        mentorMessage: getHouseMentorMessage(randomHouse),
      }

      // Reveal which house is assigned + spell
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
        Gryffindor: 'A brave heart can light up the darkest night. May your strength bring hope to your friends.',
        Hufflepuff: 'Gentleness and patience are your sources of strength. May your kindness be your greatest magic.',
        Ravenclaw: 'The desire for wisdom and exploration will guide you. Knowledge is true magic.',
        Slytherin: 'Only true determination and belief can control your destiny.',
      }
      return messages[house]
    }

    async function revealHouseAndSpell(house: House, spell: string): Promise<void> {
      const houseElement = document.querySelector(
        `.house-banner.${house.toLowerCase()}`
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
      // Move to next step => Wizard profile
      step.value = 10
    }

    // ==========================
    // Save Wizard Profile to file + TTS
    // ==========================
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
      //
      // const blob = new Blob([profileText], { type: 'text/plain' })
      // const url = URL.createObjectURL(blob)
      // const a = document.createElement('a')
      // a.href = url
      // a.download = 'wizard-profile.txt'
      // a.click()
      // URL.revokeObjectURL(url)

      // Text-to-speech
      const speech = new SpeechSynthesisUtterance(profileText)
      speech.lang = 'en-US'
      speechSynthesis.speak(speech)

      const imageDom = this.$refs.imageDom as HTMLElement;

      // Taking screenshots with html2canvas
      html2canvas(imageDom).then((canvas) => {
        // Converting screenshots to Data URLs
        const image = canvas.toDataURL('image/png');

        // Create a download link and download
        const link = document.createElement('a');
        link.href = image;
        link.download = 'wizard-profile.png'; // Set the download file name
        link.click();
      }).catch(error => {
        console.error('Screenshot failed:', error);
      });

    }

    // ==========================
    // Post Profile to server
    // ==========================
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
      // #### Example Post
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

    // ==========================
    // add model composables
    // ==========================
    const { loading, result, error, queryHuggingFace } = useHuggingFace()
    //2.create prompt
    function buildPixelPrompt(): string {
      return `
      create an 8 bits profile with Pixel style,
      theme is magic, Harry Potter,
      Wizard with personality is '${userData.value.mbti}'
      and gender is '${userData.value.gender}',
      background is '${userData.value.scene}'
      `.trim()
    }
    //3.generate the 8-bit image
    async function generatePixelWizard() {
      const prompt = buildPixelPrompt()
      await queryHuggingFace({ inputs: prompt })
      // result.value is the iamge
    }

    const pixelWizardImageUrl = computed(() => {
      if (!result.value) return ''
      return URL.createObjectURL(result.value)
    })

    const avatarUrl = computed(() => {
      if (pixelWizardImageUrl.value) {
        return pixelWizardImageUrl.value; // 优先显示生成头像
      }
      // 根据性别显示默认头像
      return userData.value.gender === 'male' ? maleAvatarUrl : femaleAvatarUrl;
    });


    // ==========================
    // NEW GAME LOGIC
    // ==========================
    // --- 1) Spell Knowledge Quiz (2 questions) ---
    const spellQuestions = ref([
      {
        question: 'Which spell is used to disarm your opponent?',
        options: ['Expelliarmus', 'Avada Kedavra'],
        correctAnswer: 'Expelliarmus',
      },
      {
        question: 'Which spell is used to conjure a Patronus?',
        options: ['Expecto Patronum', 'Wingardium Leviosa'],
        correctAnswer: 'Expecto Patronum',
      },
    ])
    const spellAnswers = ref<string[]>(['', ''])

    // --- 2) Potion Knowledge Quiz (3 questions) ---
    const potionQuestions = ref([
      {
        question: 'Which potion grants good luck for a period of time?',
        options: ['Felix Felicis', 'Polyjuice Potion'],
        correctAnswer: 'Felix Felicis',
      },
      {
        question: 'Which potion can change a person’s appearance?',
        options: ['Amortentia', 'Polyjuice Potion'],
        correctAnswer: 'Polyjuice Potion',
      },
      {
        question: 'Which potion is known as the most powerful love potion?',
        options: ['Amortentia', 'Wolfsbane Potion'],
        correctAnswer: 'Amortentia',
      },
    ])
    const potionAnswers = ref<string[]>(['', '', ''])

    // --- 3) Magic Knowledge Quiz (5 questions) ---
    const magicQuestions = ref([
      {
        question: 'Which creature guards the wizard bank, Gringotts?',
        options: ['Dragons', 'Goblins'],
        correctAnswer: 'Goblins',
      },
      {
        question: 'Which magical device displays the user’s deepest desire?',
        options: ['The Mirror of Erised', 'The Sorting Hat'],
        correctAnswer: 'The Mirror of Erised',
      },
      {
        question: 'Which wizarding sport is played flying on broomsticks?',
        options: ['Quidditch', 'Gobstones'],
        correctAnswer: 'Quidditch',
      },
      {
        question: 'What are the non-magical folk called?',
        options: ['Mudbloods', 'Muggles'],
        correctAnswer: 'Muggles',
      },
      {
        question: 'Which magical transportation uses a special powder to travel between fireplaces?',
        options: ['Floo Network', 'Apparition'],
        correctAnswer: 'Floo Network',
      },
    ])
    const magicAnswers = ref<string[]>(['', '', '', '', ''])

    // --- Score & dice result ---
    const totalScore = ref(0)
    // Control can only roll the dice once
    const diceRolled = ref(false)
    const diceResult = ref<number | null>(null)

    /**
     * Checks and calculates the score for Spell Knowledge Quiz
     */
    function submitSpellQuiz() {
      let score = 0
      spellQuestions.value.forEach((q, idx) => {
        if (spellAnswers.value[idx] === q.correctAnswer) score += 10
      })
      totalScore.value += score
      nextStep()
    }

    /**
     * Checks and calculates the score for Potion Knowledge Quiz
     */
    function submitPotionQuiz() {
      let score = 0
      potionQuestions.value.forEach((q, idx) => {
        if (potionAnswers.value[idx] === q.correctAnswer) score += 10
      })
      totalScore.value += score
      nextStep()
    }

    /**
     * Checks and calculates the score for Magic Knowledge Quiz
     */
    function submitMagicQuiz() {
      let score = 0
      magicQuestions.value.forEach((q, idx) => {
        if (magicAnswers.value[idx] === q.correctAnswer) score += 10
      })
      totalScore.value += score
      nextStep()
    }

    /**
     * Rolls a dice from -50 to +50, but only once
     */
    function rollDice() {
      if (diceRolled.value) return // If you have already rolled, don't roll again

      // random from -50 to +50
      //const randomValue = Math.floor(Math.random() * 101) - 50
      const randomValue = Math.floor(Math.random() * 101)
      diceResult.value = randomValue
      totalScore.value += randomValue
      diceRolled.value = true
    }

    /**
     * Proceed to game result step after dice roll
     */
    function finishDiceGame() {
      step.value = 8
      showDialog.value = false
      if (totalScore.value >= 60) {
      generatePixelWizard()
      }
      setTimeout(async () => {
        showDialog.value = true
        if (dialogText.value) {
          await typeText(currentDialog.value, dialogText.value)
        }
      }, 10000)
    }



    return {
      // Steps
      step,
      showDialog,

      // Data
      userData,
      wizardProfile,
      wizardName,
      houses,
      maleAvatarUrl,
      femaleAvatarUrl,
      avatarUrl,

      //model image result
      loading,
      error,
      generatePixelWizard,
      pixelWizardImageUrl,

      // Refs
      spellElement,
      dialogText,

      // Computed
      houseThemeColor,
      houseBackgroundImage,
      currentTitle,
      currentSpeaker,
      currentDialog,
      backgroundStyle,

      // Functions (common flow)
      generateWizardName,
      nextStep,
      saveProfile,
      postProfile,

      // Sorting
      goToSortingCeremony,
      startSortingCeremony,

      // Game logic
      spellQuestions,
      spellAnswers,
      potionQuestions,
      potionAnswers,
      magicQuestions,
      magicAnswers,
      totalScore,
      diceResult,
      diceRolled,
      submitSpellQuiz,
      submitPotionQuiz,
      submitMagicQuiz,
      rollDice,
      finishDiceGame,
    }
  },
})
</script>

<style scoped>
/*
  -------------------------------------------
  Overall page style
  -------------------------------------------
*/
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

/*
  -------------------------------------------
  Ceremony container & card
  -------------------------------------------
*/
.ceremony-container {
  width: 90%;
  max-width: 1000px;
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

/*
  -------------------------------------------
  Titles & text
  -------------------------------------------
*/
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

/*
  -------------------------------------------
  Avatar icons
  -------------------------------------------
*/
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

/*
  -------------------------------------------
  Inputs & Buttons
  -------------------------------------------
*/
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

.magical-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.magical-button:hover:enabled {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

/*
  -------------------------------------------
  Sorting Ceremony Animations
  -------------------------------------------
*/
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

/*
  -------------------------------------------
  Wizard Profile
  -------------------------------------------
*/
.wizard-profile {
  width: 919px;
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
  padding-top: 30%;
}

.profile-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  padding: 0 1rem;
  padding-top: 1px;
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

/*
  -------------------------------------------
  Quizzes
  -------------------------------------------
*/
.quiz-step {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.quiz-question {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: left;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quiz-option input {
  margin-right: 0.5rem;
}

/*
  -------------------------------------------
  Keyframes
  -------------------------------------------
*/
@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes wobble {
  0%, 100% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  50% {
    transform: translate(-50%, -50%) rotate(5deg);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
