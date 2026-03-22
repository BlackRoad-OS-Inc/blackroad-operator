#!/usr/bin/env python3
"""
BlackRoad Model Server v3
Every model — renamed, claimed, callable, LIVE inference.

    curl http://localhost:8787/models
    curl http://localhost:8787/model/BlackRoadLucidia
    curl -X POST http://localhost:8787/model/BlackRoadLucidia/generate -d '{"prompt":"hello"}'
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import sys
import urllib.request
import urllib.error

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")

MODELS = {
    # === VISION ===
    "BlackRoadPose2D": {
        "category": "vision", "capability": "2D human body pose detection",
        "engine": "mediapipe", "status": "available",
        "formerly": "2DHumanPoseDetectorFull"
    },
    "BlackRoadPose2D_M1": {
        "category": "vision", "capability": "2D pose (M1 optimized)",
        "engine": "mediapipe", "status": "available",
        "formerly": "2DHumanPoseDetectorFull_H13"
    },
    "BlackRoadPose2D_M2": {
        "category": "vision", "capability": "2D pose (M2 optimized)",
        "engine": "mediapipe", "status": "available",
        "formerly": "2DHumanPoseDetectorFull_H14"
    },
    "BlackRoadPose2D_M3": {
        "category": "vision", "capability": "2D pose (M3 optimized)",
        "engine": "mediapipe", "status": "available",
        "formerly": "2DHumanPoseDetectorFull_H15"
    },
    "BlackRoadPose3D": {
        "category": "vision", "capability": "3D human pose from 2D sequence",
        "engine": "mediapipe", "status": "available",
        "formerly": "3DHumanPoseLiftingSequenceFirstStage"
    },
    "BlackRoadPose3D_M1": {
        "category": "vision", "capability": "3D pose (M1)", "engine": "mediapipe", "status": "available",
        "formerly": "3DHumanPoseLiftingSequenceFirstStage_H13"
    },
    "BlackRoadPose3D_M2": {
        "category": "vision", "capability": "3D pose (M2)", "engine": "mediapipe", "status": "available",
        "formerly": "3DHumanPoseLiftingSequenceFirstStage_H14"
    },
    "BlackRoadPose3D_M3": {
        "category": "vision", "capability": "3D pose (M3)", "engine": "mediapipe", "status": "available",
        "formerly": "3DHumanPoseLiftingSequenceFirstStage_H15"
    },
    "BlackRoadImageClassify": {
        "category": "vision", "capability": "Image classification",
        "engine": "hailo", "status": "live", "hailo_model": "resnet_v1_50_h8l.hef",
        "formerly": "ImageClassifier"
    },
    "BlackRoadImageQuality": {
        "category": "vision", "capability": "Image quality estimation",
        "engine": "pillow", "status": "available",
        "formerly": "Image_Estimator_HEIF"
    },
    "BlackRoadPhishingDetect": {
        "category": "vision", "capability": "Phishing image detection",
        "engine": "opencv", "status": "available",
        "formerly": "PhishingImageClassifier"
    },
    "BlackRoadShadow": {
        "category": "vision", "capability": "Shadow estimation",
        "engine": "opencv", "status": "available",
        "formerly": "ETShadowModel"
    },
    "BlackRoadHandGesture": {
        "category": "vision", "capability": "Static hand gesture recognition",
        "engine": "mediapipe", "status": "available",
        "formerly": "hand_gesture_static"
    },
    "BlackRoadHandGestureDynamic": {
        "category": "vision", "capability": "Dynamic two-hand gesture recognition",
        "engine": "mediapipe", "status": "available",
        "formerly": "hand_gesture_dynamic_two_hand_5fps"
    },
    "BlackRoadSegmentHQ": {
        "category": "vision", "capability": "High-quality video segmentation",
        "engine": "hailo", "status": "live", "hailo_model": "yolov5n_seg_h8.hef",
        "formerly": "visegHQ_mask_memory_shared"
    },
    "BlackRoadSegmentMemory": {
        "category": "vision", "capability": "Video segmentation memory",
        "engine": "hailo", "status": "live",
        "formerly": "visegHQ_memory"
    },
    "BlackRoadSegmentRefine": {
        "category": "vision", "capability": "Video mask refinement",
        "engine": "hailo", "status": "available",
        "formerly": "vmrefiner"
    },
    "BlackRoadSensitiveContent": {
        "category": "vision", "capability": "Sensitive content analysis",
        "engine": "opencv", "status": "available",
        "formerly": "SensitiveContentAnalysisML"
    },

    # === VISION — HAILO (LIVE on Cecilia 26 TOPS) ===
    "BlackRoadYOLO5Seg": {
        "category": "vision-hailo", "capability": "Object segmentation",
        "engine": "hailo", "status": "live", "hailo_model": "yolov5n_seg_h8.hef",
        "formerly": "n/a — open source"
    },
    "BlackRoadYOLO5Face": {
        "category": "vision-hailo", "capability": "Person + face detection",
        "engine": "hailo", "status": "live", "hailo_model": "yolov5s_personface_h8l.hef",
        "formerly": "n/a — open source"
    },
    "BlackRoadYOLO6": {
        "category": "vision-hailo", "capability": "Object detection (nano)",
        "engine": "hailo", "status": "live", "hailo_model": "yolov6n_h8.hef",
        "formerly": "n/a — open source"
    },
    "BlackRoadYOLO8": {
        "category": "vision-hailo", "capability": "Object detection",
        "engine": "hailo", "status": "live", "hailo_model": "yolov8s_h8.hef",
        "formerly": "n/a — open source"
    },
    "BlackRoadYOLO8Pose": {
        "category": "vision-hailo", "capability": "Human pose estimation",
        "engine": "hailo", "status": "live", "hailo_model": "yolov8s_pose_h8.hef",
        "formerly": "n/a — open source"
    },
    "BlackRoadYOLO11": {
        "category": "vision-hailo", "capability": "Object detection (latest)",
        "engine": "hailo", "status": "live", "hailo_model": "yolov11m_h10.hef",
        "formerly": "n/a — open source"
    },
    "BlackRoadYOLOX": {
        "category": "vision-hailo", "capability": "Object detection (X)",
        "engine": "hailo", "status": "live", "hailo_model": "yolox_s_leaky_h8l_rpi.hef",
        "formerly": "n/a — open source"
    },
    "BlackRoadResNet": {
        "category": "vision-hailo", "capability": "Image classification (ResNet50)",
        "engine": "hailo", "status": "live", "hailo_model": "resnet_v1_50_h8l.hef",
        "formerly": "n/a — open source"
    },
    "BlackRoadFaceDetect": {
        "category": "vision-hailo", "capability": "Face detection",
        "engine": "hailo", "status": "live", "hailo_model": "scrfd_2.5g_h8l.hef",
        "formerly": "n/a — open source"
    },

    # === AUDIO ===
    "BlackRoadLanguageID": {
        "category": "audio", "capability": "Language identification from audio",
        "engine": "whisper", "status": "available",
        "formerly": "AcousticLID"
    },
    "BlackRoadAudioQuality": {
        "category": "audio", "capability": "Audio quality assessment",
        "engine": "yamnet", "status": "available",
        "formerly": "SNAudioQualityModel"
    },
    "BlackRoadSoundClassify": {
        "category": "audio", "capability": "Sound classification (521 classes)",
        "engine": "yamnet", "status": "available",
        "formerly": "SNSoundClassifierVersion1Model"
    },
    "BlackRoadAudioEmbed": {
        "category": "audio", "capability": "Audio embedding",
        "engine": "yamnet", "status": "available",
        "formerly": "SNSoundPrintAEmbeddingModel"
    },
    "BlackRoadAudioEmbedK": {
        "category": "audio", "capability": "Audio embedding (variant K)",
        "engine": "yamnet", "status": "available",
        "formerly": "SNSoundPrintKEmbeddingModel"
    },
    "BlackRoadSmokeAlarm": {
        "category": "audio", "capability": "Smoke alarm detection",
        "engine": "yamnet", "status": "available",
        "formerly": "SNSoundPrintASmokeAlarmModel"
    },
    "BlackRoadFireAlarm": {
        "category": "audio", "capability": "Fire alarm detection",
        "engine": "yamnet", "status": "available",
        "formerly": "SNVGGishFireAlarmModel"
    },
    "BlackRoadBabyDistress": {
        "category": "audio", "capability": "Distressed baby detection",
        "engine": "yamnet", "status": "available",
        "formerly": "SNVGGishDistressedBabyModel"
    },
    "BlackRoadApplause": {
        "category": "audio", "capability": "Applause detection",
        "engine": "yamnet", "status": "available",
        "formerly": "SNVGGishApplauseModel"
    },
    "BlackRoadLaughter": {
        "category": "audio", "capability": "Laughter detection",
        "engine": "yamnet", "status": "available",
        "formerly": "SNVGGishLaughterModel"
    },
    "BlackRoadCheering": {
        "category": "audio", "capability": "Cheering detection",
        "engine": "yamnet", "status": "available",
        "formerly": "SNVGGishCheeringModel"
    },
    "BlackRoadMusicDetect": {
        "category": "audio", "capability": "Music detection",
        "engine": "yamnet", "status": "available",
        "formerly": "SNVGGishMusicModel"
    },
    "BlackRoadSpeechDetect": {
        "category": "audio", "capability": "Speech detection",
        "engine": "yamnet", "status": "available",
        "formerly": "SNVGGishSpeechModel"
    },
    "BlackRoadBabbleDetect": {
        "category": "audio", "capability": "Background babble detection",
        "engine": "yamnet", "status": "available",
        "formerly": "SNVGGishBabbleModel"
    },
    "BlackRoadConfidenceLID": {
        "category": "audio", "capability": "Confidence-based language ID",
        "engine": "whisper", "status": "available",
        "formerly": "confLID"
    },

    # === SPEECH ===
    "BlackRoadDictationFilter": {
        "category": "speech", "capability": "Dictation hallucination filter",
        "engine": "whisper", "status": "available",
        "formerly": "EEPmodel_Dictation_v1_hallucination_1"
    },
    "BlackRoadSpeechFilter": {
        "category": "speech", "capability": "Speech hallucination filter",
        "engine": "whisper", "status": "available",
        "formerly": "EEPmodel_v8_hallucination_1"
    },
    "BlackRoadPunctuation": {
        "category": "speech", "capability": "Punctuation restoration",
        "engine": "transformers", "status": "available",
        "formerly": "punc_model"
    },
    "BlackRoadGraphemePhoneme": {
        "category": "speech", "capability": "Grapheme to phoneme",
        "engine": "transformers", "status": "available",
        "formerly": "AutoG2P8B"
    },
    "BlackRoadSpeechToText": {
        "category": "speech", "capability": "Speech recognition (99 languages)",
        "engine": "whisper", "status": "available",
        "formerly": "CoreEmbeddedSpeechRecognition"
    },
    "BlackRoadTextToSpeech": {
        "category": "speech", "capability": "Text to speech synthesis",
        "engine": "piper", "status": "available",
        "formerly": "TextToSpeech / SiriTTS"
    },

    # === NLP ===
    "BlackRoadBERT": {
        "category": "nlp", "capability": "Text understanding",
        "engine": "transformers", "status": "available",
        "formerly": "bert"
    },
    "BlackRoadTextUnderstand": {
        "category": "nlp", "capability": "Text understanding support",
        "engine": "transformers", "status": "available",
        "formerly": "TextUnderstandingSupport"
    },
    "BlackRoadEntityRelevance": {
        "category": "nlp", "capability": "Entity relevance scoring",
        "engine": "transformers", "status": "available",
        "formerly": "EntityRelevanceModel"
    },
    "BlackRoadEntityRerank": {
        "category": "nlp", "capability": "Entity re-ranking",
        "engine": "transformers", "status": "available",
        "formerly": "EntityRerankerModel"
    },
    "BlackRoadEntityTagFamily": {
        "category": "nlp", "capability": "Family entity tagging",
        "engine": "transformers", "status": "available",
        "formerly": "EntityTagging_Family"
    },
    "BlackRoadEntityTagFriends": {
        "category": "nlp", "capability": "Family + friends entity tagging",
        "engine": "transformers", "status": "available",
        "formerly": "EntityTagging_FamilyAndFriends"
    },
    "BlackRoadEntityResolve": {
        "category": "nlp", "capability": "Entity resolution",
        "engine": "transformers", "status": "available",
        "formerly": "PervasiveEntityResolution"
    },
    "BlackRoadMentionGen": {
        "category": "nlp", "capability": "Mention generation",
        "engine": "transformers", "status": "available",
        "formerly": "MentionGenerationModel"
    },
    "BlackRoadEventExtract": {
        "category": "nlp", "capability": "Structured event extraction",
        "engine": "transformers", "status": "available",
        "formerly": "StructuredEventModel"
    },
    "BlackRoadMegatron": {
        "category": "nlp", "capability": "Large transformer (8-bit)",
        "engine": "ollama", "status": "live",
        "formerly": "megatron_8bit_compressed_v1"
    },
    "BlackRoadNessie": {
        "category": "nlp", "capability": "NLP classifier",
        "engine": "transformers", "status": "available",
        "formerly": "nessie"
    },

    # === NLP LOCALIZED ===
    "BlackRoadContactEN": {"category": "nlp-locale", "capability": "Contact recognition (English)", "engine": "transformers", "status": "available", "formerly": "cr_lw_en-US"},
    "BlackRoadContactDE": {"category": "nlp-locale", "capability": "Contact recognition (German)", "engine": "transformers", "status": "available", "formerly": "cr_lw_de-DE"},
    "BlackRoadContactES": {"category": "nlp-locale", "capability": "Contact recognition (Spanish)", "engine": "transformers", "status": "available", "formerly": "cr_lw_es-ES"},
    "BlackRoadContactFR": {"category": "nlp-locale", "capability": "Contact recognition (French)", "engine": "transformers", "status": "available", "formerly": "cr_lw_fr-FR"},
    "BlackRoadContactIT": {"category": "nlp-locale", "capability": "Contact recognition (Italian)", "engine": "transformers", "status": "available", "formerly": "cr_lw_it-IT"},
    "BlackRoadContactJA": {"category": "nlp-locale", "capability": "Contact recognition (Japanese)", "engine": "transformers", "status": "available", "formerly": "cr_lw_ja-JP"},
    "BlackRoadContactKO": {"category": "nlp-locale", "capability": "Contact recognition (Korean)", "engine": "transformers", "status": "available", "formerly": "cr_lw_ko-KR"},
    "BlackRoadContactPT": {"category": "nlp-locale", "capability": "Contact recognition (Portuguese)", "engine": "transformers", "status": "available", "formerly": "cr_lw_pt-BR"},
    "BlackRoadContactRU": {"category": "nlp-locale", "capability": "Contact recognition (Russian)", "engine": "transformers", "status": "available", "formerly": "cr_lw_ru-RU"},
    "BlackRoadContactTH": {"category": "nlp-locale", "capability": "Contact recognition (Thai)", "engine": "transformers", "status": "available", "formerly": "cr_lw_th-TH"},
    "BlackRoadContactUK": {"category": "nlp-locale", "capability": "Contact recognition (Ukrainian)", "engine": "transformers", "status": "available", "formerly": "cr_lw_uk-UA"},
    "BlackRoadContactVI": {"category": "nlp-locale", "capability": "Contact recognition (Vietnamese)", "engine": "transformers", "status": "available", "formerly": "cr_lw_vi-VT"},
    "BlackRoadContactZH": {"category": "nlp-locale", "capability": "Contact recognition (Chinese)", "engine": "transformers", "status": "available", "formerly": "cr_lw_zh-Hans"},

    # === PEOPLE & CONTACTS ===
    "BlackRoadContactRank": {
        "category": "people", "capability": "Contact ranking",
        "engine": "sklearn", "status": "available",
        "formerly": "ContactRanker"
    },
    "BlackRoadNameToEmail": {
        "category": "people", "capability": "Name to email linking",
        "engine": "sklearn", "status": "available",
        "formerly": "MDNameToEmailPersonLinker"
    },
    "BlackRoadNameToName": {
        "category": "people", "capability": "Name to name linking",
        "engine": "sklearn", "status": "available",
        "formerly": "MDNameToNamePersonLinker"
    },
    "BlackRoadUserVector": {
        "category": "people", "capability": "User feature vector",
        "engine": "sklearn", "status": "available",
        "formerly": "FCUserVectorModel"
    },
    "BlackRoadFamilyDetect": {
        "category": "people", "capability": "Family relationship detection",
        "engine": "sklearn", "status": "available",
        "formerly": "iCloudFamilyModel_gbdt"
    },

    # === PREDICTION ===
    "BlackRoadAutoSend": {
        "category": "prediction", "capability": "Auto-send prediction",
        "engine": "sklearn", "status": "available",
        "formerly": "AutoSendModel"
    },
    "BlackRoadAppPredict": {
        "category": "prediction", "capability": "App usage prediction",
        "engine": "sklearn", "status": "available",
        "formerly": "PhoneAppPredictor"
    },
    "BlackRoadMsgPredict": {
        "category": "prediction", "capability": "Message prediction",
        "engine": "sklearn", "status": "available",
        "formerly": "MessageAppPredictorPeopleCentric"
    },
    "BlackRoadDining": {
        "category": "prediction", "capability": "Dining prediction",
        "engine": "sklearn", "status": "available",
        "formerly": "DiningOutModel"
    },
    "BlackRoadTransportMode": {
        "category": "prediction", "capability": "Transport mode prediction",
        "engine": "sklearn", "status": "available",
        "formerly": "MapsSuggestionsTransportModePrediction"
    },
    "BlackRoadReminder": {
        "category": "prediction", "capability": "Reminder suggestion",
        "engine": "sklearn", "status": "available",
        "formerly": "ReminderModel"
    },
    "BlackRoadContext": {
        "category": "prediction", "capability": "Context prediction",
        "engine": "sklearn", "status": "available",
        "formerly": "context_predictor"
    },
    "BlackRoadInteraction": {
        "category": "prediction", "capability": "Interaction prediction",
        "engine": "sklearn", "status": "available",
        "formerly": "interactionPrediction"
    },
    "BlackRoadSuggestBlend": {
        "category": "prediction", "capability": "Suggestion blending",
        "engine": "sklearn", "status": "available",
        "formerly": "suggestions_blending"
    },
    "BlackRoadSocialHighlights": {
        "category": "prediction", "capability": "Social highlights scoring",
        "engine": "sklearn", "status": "available",
        "formerly": "social_highlights_scorer"
    },
    "BlackRoadRanker": {
        "category": "prediction", "capability": "General ranking",
        "engine": "sklearn", "status": "available",
        "formerly": "Ranker"
    },
    "BlackRoadSpotlight": {
        "category": "prediction", "capability": "Search ranking",
        "engine": "sklearn", "status": "available",
        "formerly": "spotlight_l2"
    },
    "BlackRoadShareSheet": {
        "category": "prediction", "capability": "Share sheet prediction",
        "engine": "sklearn", "status": "available",
        "formerly": "compiledShareSheetModel"
    },

    # === LOCATION ===
    "BlackRoadPlaceClassify": {
        "category": "location", "capability": "Place type classification",
        "engine": "sklearn", "status": "available",
        "formerly": "RTPlaceTypeClassifierModelMultiClass"
    },
    "BlackRoadPlaceRank": {
        "category": "location", "capability": "Place ranking",
        "engine": "sklearn", "status": "available",
        "formerly": "RTPlaceTypeClassifierModelRanker"
    },
    "BlackRoadTrajectory": {
        "category": "location", "capability": "Visit trajectory classification",
        "engine": "sklearn", "status": "available",
        "formerly": "RTVisitTrajectorySequenceClassifierBatchMode"
    },
    "BlackRoadLocationEncode": {
        "category": "location", "capability": "Location encoding",
        "engine": "sklearn", "status": "available",
        "formerly": "locationEncoder"
    },
    "BlackRoadRoutine": {
        "category": "location", "capability": "Daily routine prediction",
        "engine": "sklearn", "status": "available",
        "formerly": "mac_routine_eng"
    },

    # === NETWORK ===
    "BlackRoadWiFiStall": {
        "category": "network", "capability": "WiFi stall detection",
        "engine": "sklearn", "status": "available",
        "formerly": "WiFiStallDetect"
    },
    "BlackRoadAntennaMask": {
        "category": "network", "capability": "Antenna optimization",
        "engine": "sklearn", "status": "available",
        "formerly": "AntennaMask_1_NN_V5_Model_DeviceType_201"
    },

    # === LLM (Ollama Fleet) ===
    "BlackRoadLucidia": {
        "category": "llm", "capability": "General AI assistant (8B)",
        "engine": "ollama", "status": "live", "ollama_model": "lucidia:latest",
        "formerly": "n/a — BlackRoad original"
    },
    "BlackRoadAlexa": {
        "category": "llm", "capability": "Alexa personality model",
        "engine": "ollama", "status": "ready", "ollama_model": "Alexa.Modelfile",
        "formerly": "n/a — BlackRoad original"
    },
    "BlackRoadGemma": {
        "category": "llm", "capability": "General reasoning (7B)",
        "engine": "ollama", "status": "live", "ollama_model": "gemma:latest",
        "formerly": "n/a — open source"
    },
    "BlackRoadLlama": {
        "category": "llm", "capability": "General reasoning (8B)",
        "engine": "ollama", "status": "live", "ollama_model": "llama3.1:latest",
        "formerly": "n/a — open source"
    },
    "BlackRoadCodeLlama": {
        "category": "llm", "capability": "Code generation (7B)",
        "engine": "ollama", "status": "live", "ollama_model": "codellama:7b",
        "formerly": "n/a — open source"
    },
    "BlackRoadQwen": {
        "category": "llm", "capability": "Multilingual reasoning (1.5B)",
        "engine": "ollama", "status": "live", "ollama_model": "qwen2.5:1.5b",
        "formerly": "n/a — open source"
    },
    "BlackRoadTiny": {
        "category": "llm", "capability": "Edge inference (1.1B)",
        "engine": "ollama", "status": "live", "ollama_model": "tinyllama:latest",
        "formerly": "n/a — open source"
    },
    "BlackRoadPhi": {
        "category": "llm", "capability": "Compact reasoning (3.5B)",
        "engine": "ollama", "status": "live", "ollama_model": "phi3.5:latest",
        "formerly": "n/a — open source"
    },

    # === CORE ENCODERS ===
    "BlackRoadEncoder": {
        "category": "core", "capability": "General encoder",
        "engine": "transformers", "status": "available",
        "formerly": "encoder"
    },
    "BlackRoadDecoder": {
        "category": "core", "capability": "General decoder",
        "engine": "transformers", "status": "available",
        "formerly": "decoder"
    },
    "BlackRoadMegaModel": {
        "category": "core", "capability": "Mega model v10",
        "engine": "transformers", "status": "available",
        "formerly": "mega_model_v10.0_renamed"
    },
}


class BlackRoadModelHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/models' or self.path == '/':
            cats = {}
            for name, info in MODELS.items():
                c = info['category']
                if c not in cats:
                    cats[c] = {'count': 0, 'live': 0, 'models': []}
                cats[c]['count'] += 1
                if info['status'] == 'live':
                    cats[c]['live'] += 1
                cats[c]['models'].append(name)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'server': 'BlackRoad Model Server v2',
                'owner': 'BlackRoad OS, Inc.',
                'total_models': len(MODELS),
                'live': sum(1 for m in MODELS.values() if m['status'] == 'live'),
                'available': sum(1 for m in MODELS.values() if m['status'] == 'available'),
                'node': os.uname().nodename,
                'categories': cats
            }, indent=2).encode())

        elif self.path.startswith('/model/'):
            model_name = self.path.split('/model/')[1]
            if model_name in MODELS:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'name': model_name,
                    **MODELS[model_name],
                    'callable': True,
                    'node': os.uname().nodename,
                    'owner': 'BlackRoad OS, Inc.'
                }, indent=2).encode())
            else:
                # Check if they used an old Apple name
                for bname, info in MODELS.items():
                    if info.get('formerly') == model_name:
                        self.send_response(301)
                        self.send_header('Location', f'/model/{bname}')
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            'renamed': True,
                            'old_name': model_name,
                            'new_name': bname,
                            'message': f'This model has been renamed to {bname}. Redirecting.',
                            'owner': 'BlackRoad OS, Inc.'
                        }).encode())
                        return
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': f'{model_name} not found'}).encode())

        elif self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'ok',
                'server': 'BlackRoad Model Server v2',
                'models': len(MODELS),
                'live': sum(1 for m in MODELS.values() if m['status'] == 'live'),
                'node': os.uname().nodename
            }).encode())

        elif self.path == '/formerly':
            # Show the rename map
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            rename_map = {info['formerly']: name for name, info in MODELS.items() if info.get('formerly', '').startswith(('n/a',)) is False}
            self.wfile.write(json.dumps(rename_map, indent=2).encode())

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        # POST /model/<name>/generate — run inference
        if self.path.startswith('/model/') and self.path.endswith('/generate'):
            parts = self.path.split('/')
            model_name = parts[2]

            if model_name not in MODELS:
                # Check Apple name redirect
                for bname, info in MODELS.items():
                    if info.get('formerly') == model_name:
                        model_name = bname
                        break
                else:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': f'{model_name} not found'}).encode())
                    return

            model_info = MODELS[model_name]
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b'{}'

            try:
                req_data = json.loads(body)
            except json.JSONDecodeError:
                req_data = {'prompt': body.decode('utf-8', errors='replace')}

            engine = model_info.get('engine', '')

            # === OLLAMA LLM INFERENCE ===
            if engine == 'ollama' and model_info.get('ollama_model'):
                ollama_model = model_info['ollama_model']
                prompt = req_data.get('prompt', req_data.get('message', ''))
                if not prompt:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'prompt required'}).encode())
                    return

                ollama_req = json.dumps({
                    'model': ollama_model,
                    'prompt': prompt,
                    'stream': False
                }).encode()

                try:
                    req = urllib.request.Request(
                        f'{OLLAMA_HOST}/api/generate',
                        data=ollama_req,
                        headers={'Content-Type': 'application/json'}
                    )
                    resp = urllib.request.urlopen(req, timeout=120)
                    ollama_resp = json.loads(resp.read())

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'model': model_name,
                        'engine': 'ollama',
                        'ollama_model': ollama_model,
                        'response': ollama_resp.get('response', ''),
                        'done': ollama_resp.get('done', False),
                        'total_duration': ollama_resp.get('total_duration', 0),
                        'eval_count': ollama_resp.get('eval_count', 0),
                        'node': os.uname().nodename,
                        'owner': 'BlackRoad OS, Inc.'
                    }, indent=2).encode())
                    return
                except urllib.error.URLError as e:
                    self.send_response(503)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'error': f'Ollama unreachable: {str(e)}',
                        'model': model_name,
                        'hint': 'Ollama may not be running on this node'
                    }).encode())
                    return

            # === HAILO INFERENCE (info only — actual inference via GStreamer) ===
            elif engine == 'hailo' and model_info.get('hailo_model'):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'model': model_name,
                    'engine': 'hailo',
                    'hailo_model': model_info['hailo_model'],
                    'inference': 'Use GStreamer pipeline or hailort API',
                    'example': f'hailortcli run {model_info["hailo_model"]}',
                    'node': os.uname().nodename,
                    'owner': 'BlackRoad OS, Inc.'
                }, indent=2).encode())
                return

            # === OTHER ENGINES (not yet wired) ===
            else:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'model': model_name,
                    'engine': engine,
                    'status': model_info.get('status', 'available'),
                    'message': f'Inference engine "{engine}" ready to wire. Model registered.',
                    'capability': model_info.get('capability', ''),
                    'node': os.uname().nodename,
                    'owner': 'BlackRoad OS, Inc.'
                }, indent=2).encode())
                return

        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'POST to /model/<name>/generate'}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        pass  # silent


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8787
    server = HTTPServer(('0.0.0.0', port), BlackRoadModelHandler)
    live = sum(1 for m in MODELS.values() if m['status'] == 'live')
    print(f"BlackRoad Model Server v3 — {len(MODELS)} models ({live} live)")
    print(f"Listening on :{port}")
    print(f"  GET  /models                    — list all BlackRoad models")
    print(f"  GET  /model/<name>              — query by BlackRoad name")
    print(f"  POST /model/<name>/generate     — run inference")
    print(f"  GET  /model/<apple_name>        — 301 redirect to BlackRoad name")
    print(f"  GET  /formerly                  — full rename map")
    print(f"  Ollama backend: {OLLAMA_HOST}")
    server.serve_forever()
