import speech_recognition as sr


def listen_voice():

    recognizer = sr.Recognizer()

    recognizer.energy_threshold = 300
    recognizer.dynamic_energy_threshold = True
    recognizer.pause_threshold = 0.8


    try:

        with sr.Microphone() as source:


            print("🎤 Listening...")


            recognizer.adjust_for_ambient_noise(
                source,
                duration=1
            )


            audio = recognizer.listen(
                source,
                timeout=10,
                phrase_time_limit=20
            )


        print("🤖 Processing...")


        text = recognizer.recognize_google(
            audio
        )


        return text



    except sr.WaitTimeoutError:

        return "I did not hear anything."


    except sr.UnknownValueError:

        return "Sorry, I could not understand."


    except sr.RequestError:

        return "Speech service is unavailable."


    except Exception as e:

        print(e)

        return None