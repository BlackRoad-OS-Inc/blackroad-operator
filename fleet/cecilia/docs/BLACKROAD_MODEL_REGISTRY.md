# BlackRoad Model Registry

> Every AI capability running on BlackRoad hardware, named and claimed.
> If it runs on our iron, it's ours to name.

**Generated:** 2026-02-19
**Source:** macOS system scan (167 CoreML models, 160+ frameworks)
**Hardware:** Alexandria (M1 MacBook Pro), Cecilia (Pi 5 + Hailo-8), Lucidia (Pi 5), Octavia (Pi 5), Alice (Pi 400)

---

## Vision Models

| BlackRoad Name | Capability | Apple Original | Status |
|---|---|---|---|
| `br-pose-2d` | 2D human body pose detection | 2DHumanPoseDetectorFull | Mapped |
| `br-pose-2d-h13` | 2D pose (Apple H13 chip variant) | 2DHumanPoseDetectorFull_H13 | Mapped |
| `br-pose-2d-h14` | 2D pose (H14 variant) | 2DHumanPoseDetectorFull_H14 | Mapped |
| `br-pose-2d-h15` | 2D pose (H15 variant) | 2DHumanPoseDetectorFull_H15 | Mapped |
| `br-pose-3d` | 3D human pose lifting from 2D sequence | 3DHumanPoseLiftingSequenceFirstStage | Mapped |
| `br-pose-3d-h13` | 3D pose (H13 variant) | 3DHumanPoseLiftingSequenceFirstStage_H13 | Mapped |
| `br-pose-3d-h14` | 3D pose (H14 variant) | 3DHumanPoseLiftingSequenceFirstStage_H14 | Mapped |
| `br-pose-3d-h15` | 3D pose (H15 variant) | 3DHumanPoseLiftingSequenceFirstStage_H15 | Mapped |
| `br-image-classify` | Image classification | ImageClassifier | Mapped |
| `br-image-heif` | HEIF image quality estimation | Image_Estimator_HEIF | Mapped |
| `br-phishing-detect` | Phishing image classifier | PhishingImageClassifier (asset) | Mapped |
| `br-shadow` | Shadow estimation in images | ETShadowModel | Mapped |
| `br-hand-gesture-static` | Static hand gesture recognition | hand_gesture_static | Mapped |
| `br-hand-gesture-dynamic` | Dynamic two-hand gesture recognition | hand_gesture_dynamic_two_hand_5fps | Mapped |
| `br-segmentation-hq` | High-quality video segmentation (mask/memory) | visegHQ_mask_memory_shared | Mapped |
| `br-segmentation-mem` | Video segmentation memory | visegHQ_memory | Mapped |
| `br-segmentation-refine` | Video mask refinement | vmrefiner | Mapped |
| `br-sensitive-content` | Sensitive content analysis | SensitiveContentAnalysisML | Mapped |

## Vision — Hailo-8 (Cecilia, 26 TOPS)

| BlackRoad Name | Capability | Model File | Status |
|---|---|---|---|
| `br-yolo-v5-seg` | Object segmentation (YOLOv5) | yolov5n_seg_h8.hef | Live |
| `br-yolo-v5-face` | Person + face detection | yolov5s_personface_h8l.hef | Live |
| `br-yolo-v6` | Object detection (YOLOv6 nano) | yolov6n_h8.hef | Live |
| `br-yolo-v8` | Object detection (YOLOv8s) | yolov8s_h8.hef | Live |
| `br-yolo-v8-pose` | Human pose estimation (YOLOv8) | yolov8s_pose_h8.hef | Live |
| `br-yolo-v11` | Object detection (YOLOv11m) | yolov11m_h10.hef | Live |
| `br-yolo-x` | Object detection (YOLOX-S) | yolox_s_leaky_h8l_rpi.hef | Live |
| `br-resnet-50` | Image classification (ResNet50) | resnet_v1_50_h8l.hef | Live |
| `br-face-detect` | Face detection (SCRFD) | scrfd_2.5g_h8l.hef | Live |

## Audio & Speech Models

| BlackRoad Name | Capability | Apple Original | Status |
|---|---|---|---|
| `br-acoustic-lid` | Language identification from audio | AcousticLID | Mapped |
| `br-audio-quality` | Audio quality assessment | SNAudioQualityModel | Mapped |
| `br-sound-classify` | General sound classification | SNSoundClassifierVersion1Model | Mapped |
| `br-sound-embed` | Audio embedding (SoundPrint A) | SNSoundPrintAEmbeddingModel | Mapped |
| `br-sound-embed-k` | Audio embedding (SoundPrint K) | SNSoundPrintKEmbeddingModel | Mapped |
| `br-smoke-alarm` | Smoke alarm detection | SNSoundPrintASmokeAlarmModel | Mapped |
| `br-fire-alarm` | Fire alarm detection | SNVGGishFireAlarmModel | Mapped |
| `br-baby-distress` | Distressed baby detection | SNVGGishDistressedBabyModel | Mapped |
| `br-applause` | Applause detection | SNVGGishApplauseModel | Mapped |
| `br-laughter` | Laughter detection | SNVGGishLaughterModel | Mapped |
| `br-cheering` | Cheering detection | SNVGGishCheeringModel | Mapped |
| `br-music-detect` | Music detection | SNVGGishMusicModel | Mapped |
| `br-speech-detect` | Speech detection | SNVGGishSpeechModel | Mapped |
| `br-babble-detect` | Background babble detection | SNVGGishBabbleModel | Mapped |
| `br-audio-embed` | General audio embedding (VGGish) | SNVGGishEmbeddingModel | Mapped |
| `br-conf-lid` | Confidence-based language ID | confLID | Mapped |
| `br-punctuation` | Punctuation restoration | punc_model | Mapped |
| `br-dictation-filter` | Dictation hallucination filtering | EEPmodel_Dictation_v1_hallucination_1 | Mapped |
| `br-speech-filter` | General hallucination filtering | EEPmodel_v8_hallucination_1 | Mapped |

## NLP & Text Models

| BlackRoad Name | Capability | Apple Original | Status |
|---|---|---|---|
| `br-bert` | BERT text understanding | bert | Mapped |
| `br-text-understand` | Text understanding support | TextUnderstandingSupport | Mapped |
| `br-entity-relevance` | Entity relevance scoring | EntityRelevanceModel | Mapped |
| `br-entity-rerank` | Entity re-ranking | EntityRerankerModel | Mapped |
| `br-entity-tag-family` | Family entity tagging | EntityTagging_Family | Mapped |
| `br-entity-tag-friends` | Family + friends entity tagging | EntityTagging_FamilyAndFriends | Mapped |
| `br-entity-resolve` | Pervasive entity resolution | PervasiveEntityResolution | Mapped |
| `br-mention-gen` | Mention/reference generation | MentionGenerationModel | Mapped |
| `br-grapheme-phoneme` | Grapheme-to-phoneme (8B) | AutoG2P8B | Mapped |
| `br-megatron` | Large transformer (8-bit compressed) | megatron_8bit_compressed_v1 | Mapped |
| `br-megatron-hsjs` | Megatron HSJS variant | megatron_hsjs_8bit_compressed_v1 | Mapped |
| `br-megatron-mtl` | Megatron multi-task variant | megatron_mtl_v3_8bit | Mapped |
| `br-nessie` | NLP model (Nessie) | nessie | Mapped |
| `br-structured-event` | Structured event extraction | StructuredEventModel | Mapped |
| `br-event-gazetteer` | Event entity gazetteer | structuredEventGazetteer | Mapped |

## NLP — Localized Contact Recognition

| BlackRoad Name | Language | Apple Original | Status |
|---|---|---|---|
| `br-contact-de` | German | cr_lw_de-DE | Mapped |
| `br-contact-en` | English | cr_lw_en-US | Mapped |
| `br-contact-es` | Spanish | cr_lw_es-ES | Mapped |
| `br-contact-fr` | French | cr_lw_fr-FR | Mapped |
| `br-contact-it` | Italian | cr_lw_it-IT | Mapped |
| `br-contact-ja` | Japanese | cr_lw_ja-JP | Mapped |
| `br-contact-ko` | Korean | cr_lw_ko-KR | Mapped |
| `br-contact-pt` | Portuguese (Brazil) | cr_lw_pt-BR | Mapped |
| `br-contact-ru` | Russian | cr_lw_ru-RU | Mapped |
| `br-contact-th` | Thai | cr_lw_th-TH | Mapped |
| `br-contact-uk` | Ukrainian | cr_lw_uk-UA | Mapped |
| `br-contact-vi` | Vietnamese | cr_lw_vi-VT | Mapped |
| `br-contact-zh` | Chinese (Simplified) | cr_lw_zh-Hans | Mapped |

## People & Contact Models

| BlackRoad Name | Capability | Apple Original | Status |
|---|---|---|---|
| `br-contact-rank` | Contact ranking | ContactRanker | Mapped |
| `br-contact-rank-model` | Contact ranking (ML model) | ContactRankerModel | Mapped |
| `br-contact-rank-watch` | Contact ranking (watchOS/iOS) | ContactRanker_watchos_ios_baxter | Mapped |
| `br-name-to-email` | Name to email person linking | MDNameToEmailPersonLinker | Mapped |
| `br-name-to-name` | Name to name person linking | MDNameToNamePersonLinker | Mapped |
| `br-user-vector` | User feature vector | FCUserVectorModel | Mapped |
| `br-icloud-family-dt` | iCloud family model (decision tree) | iCloudFamilyModel_dt | Mapped |
| `br-icloud-family-gbdt` | iCloud family model (gradient boost) | iCloudFamilyModel_gbdt | Mapped |
| `br-icloud-family-rf` | iCloud family model (random forest) | iCloudFamilyModel_rf | Mapped |
| `br-icloud-family-ip` | iCloud family model (IP-based) | iCloudFamilyModel_IP_gbdt | Mapped |

## Prediction & Suggestion Models

| BlackRoad Name | Capability | Apple Original | Status |
|---|---|---|---|
| `br-auto-send` | Auto-send prediction | AutoSendModel | Mapped |
| `br-auto-send-private` | Private auto-send (no-op) | AutoSendPrivateNoOp | Mapped |
| `br-app-predict` | Phone app prediction | PhoneAppPredictor | Mapped |
| `br-app-predict-people` | People-centric app prediction | PhoneAppPredictorPeopleCentric | Mapped |
| `br-msg-predict-people` | People-centric message app prediction | MessageAppPredictorPeopleCentric | Mapped |
| `br-interaction-predict` | Interaction prediction | interactionPrediction | Mapped |
| `br-context-predict` | Context prediction | context_predictor | Mapped |
| `br-dining-out` | Dining out prediction | DiningOutModel | Mapped |
| `br-maps-transport` | Transport mode prediction (Maps) | MapsSuggestionsTransportModePrediction | Mapped |
| `br-reminder` | Reminder suggestion | ReminderModel | Mapped |
| `br-rule-importance` | Rule importance prediction | RuleImportancePredictor | Mapped |
| `br-share-sheet` | Share sheet suggestion | compiledShareSheetModel | Mapped |
| `br-share-sheet-base` | Share sheet baseline | sharesheetEmptyBaseModel | Mapped |
| `br-suggestions-blend` | Suggestion blending/ranking | suggestions_blending | Mapped |
| `br-social-highlights` | Social highlights scorer | social_highlights_scorer | Mapped |
| `br-social-topk` | Social highlights top-k scorer | social_highlights_top_k_scorer | Mapped |
| `br-ranker` | General ranking model | Ranker | Mapped |
| `br-spotlight-l2` | Spotlight L2 ranking | spotlight_l2 | Mapped |

## Location & Spatial Models

| BlackRoad Name | Capability | Apple Original | Status |
|---|---|---|---|
| `br-place-classify` | Place type classification (multi-class) | RTPlaceTypeClassifierModelMultiClass | Mapped |
| `br-place-rank` | Place type ranking | RTPlaceTypeClassifierModelRanker | Mapped |
| `br-visit-trajectory` | Visit trajectory sequence classification | RTVisitTrajectorySequenceClassifierBatchMode | Mapped |
| `br-location-encode` | Location encoding | locationEncoder | Mapped |
| `br-routine-eng` | Mac routine engagement | mac_routine_eng | Mapped |
| `br-routine-reg` | Mac routine regression | mac_routine_reg | Mapped |

## Network & Hardware Models

| BlackRoad Name | Capability | Apple Original | Status |
|---|---|---|---|
| `br-wifi-stall` | WiFi stall detection | WiFiStallDetect | Mapped |
| `br-antenna-mask-1` | Antenna mask NN (mask 1) | AntennaMask_1_NN_V5_Model_DeviceType_201 | Mapped |
| `br-antenna-mask-2` | Antenna mask NN (mask 2) | AntennaMask_2_NN_V5_Model_DeviceType_201 | Mapped |
| `br-antenna-scale-1` | Antenna scaling model (mask 1) | AntennaMask_1_NN_V5_ScalingModel_DeviceType_201 | Mapped |
| `br-antenna-scale-2` | Antenna scaling model (mask 2) | AntennaMask_2_NN_V5_ScalingModel_DeviceType_201 | Mapped |

## Encoder/Decoder & Core ML Models

| BlackRoad Name | Capability | Apple Original | Status |
|---|---|---|---|
| `br-encoder` | General encoder | encoder | Mapped |
| `br-decoder` | General decoder | decoder | Mapped |
| `br-cloud-mlp` | Cloud MLP with embedding | cloud_mlp_with_embedding | Mapped |
| `br-l2-xgb` | L2 XGBoost regressor | L2XGBRegressor | Mapped |
| `br-loi-onehot` | LOI type to one-hot transformer | LOITypeToOneHotTransformer | Mapped |
| `br-ppmodel-ne` | PP model NE filtering | PPModel_NE_Filtering | Mapped |
| `br-uncertainty-prompt` | Uncertainty prompting | UncertaintyPrompt | Mapped |
| `br-mega-model` | Mega model v10 | mega_model_v10.0_renamed | Mapped |
| `br-monza` | Monza v4.1 model | MonzaV4_1 | Mapped |
| `br-shallow` | Shallow classifier | shallow_model | Mapped |
| `br-u2head` | U2 head model | U2Head | Mapped |
| `br-psc` | PSC model | PSC | Mapped |
| `br-snlc` | SNLC model | SNLC | Mapped |
| `br-anst` | ANST model | anst | Mapped |
| `br-gibraltar-id` | Gibraltar identity model | gibraltar_identity_d8f9a11 | Mapped |
| `br-joint-ccqr` | Joint CCQR model | joint_ccqr | Mapped |
| `br-action-rep-counter` | Action repetition counter | action_repetition_counter | Mapped |
| `br-base-duration` | Base duration model | base_duration | Mapped |
| `br-base-engage` | Base engagement model | base_engage | Mapped |
| `br-easy-engage` | Easy engagement model | easy_engage | Mapped |
| `br-long-duration` | Long duration model | long_duration | Mapped |
| `br-m8-ane` | M8 ANE quantized model | m8_ANE_newdata_quantized | Mapped |
| `br-tcn-aftm` | TCN AFTM model | tcn_aftm_o13 | Mapped |
| `br-deoc` | DEOC model | deoc_model | Mapped |
| `br-deoc-iphone` | DEOC iPhone variant | deoc_model_iphone | Mapped |
| `br-deoc-series` | DEOC series variant | deoc_series | Mapped |
| `br-deoc-ultra` | DEOC ultra variant | deoc_ultra | Mapped |
| `br-classifier` | General classifier | classifier_model | Mapped |
| `br-model` | Generic base model | model | Mapped |
| `br-best-model` | Best model selection | best_model | Mapped |

## LLM Models (Ollama Fleet)

| BlackRoad Name | Base Model | Provider | Node | Status |
|---|---|---|---|---|
| `br-lucidia` | Llama 3.1 8B Q4_K_M | Meta (wrapped) | Octavia | Live |
| `br-alexa` | Phi-3 | Microsoft (wrapped) | Modelfile ready | Ready |
| `br-gemma-7b` | Gemma 7B | Google | Octavia, Alexandria | Live |
| `br-gemma-2b` | Gemma 2B | Google | Octavia, Lucidia, Alexandria | Live |
| `br-llama-3.1` | Llama 3.1 8B | Meta | Octavia, Alexandria | Live |
| `br-llama-3` | Llama 3 8B | Meta | Octavia, Alexandria | Live |
| `br-llama-3.2-3b` | Llama 3.2 3B | Meta | Octavia, Lucidia, Alexandria | Live |
| `br-llama-3.2-1b` | Llama 3.2 1B | Meta | Octavia, Lucidia, Alexandria | Live |
| `br-codellama` | CodeLlama 7B | Meta | Octavia, Lucidia, Alexandria | Live |
| `br-tinyllama` | TinyLlama 1.1B | Independent | Octavia, Lucidia, Alexandria | Live |
| `br-qwen-1.5b` | Qwen 2.5 1.5B | Alibaba | Octavia, Lucidia, Alexandria | Live |
| `br-qwen-0.5b` | Qwen 2.5 0.5B | Alibaba | Octavia, Alexandria | Live |
| `br-phi-3.5` | Phi 3.5 | Microsoft | Lucidia | Live |
| `br-gemma2-2b` | Gemma2 2B | Google | Lucidia | Live |

---

## Frameworks (BlackRoad Capability Map)

### Intelligence Platform

| BlackRoad Name | Capability | Apple Original |
|---|---|---|
| `br-intelligence-engine` | Core AI orchestration | IntelligenceEngine |
| `br-intelligence-platform` | AI platform layer | IntelligencePlatform |
| `br-intelligence-compute` | AI compute service | IntelligencePlatformCompute |
| `br-intelligence-core` | AI core library | IntelligencePlatformCore |
| `br-intelligence-lib` | AI platform library | IntelligencePlatformLibrary |
| `br-os-intelligence` | OS-level intelligence | OSIntelligence |
| `br-personal-intelligence` | Personal intelligence core | PersonalIntelligenceCore |
| `br-visual-intelligence` | Visual intelligence | VisualIntelligence |

### Neural & ML Runtime

| BlackRoad Name | Capability | Apple Original |
|---|---|---|
| `br-neural-engine` | Neural engine interface | AppleNeuralEngine |
| `br-neural-networks` | Neural network runtime | NeuralNetworks |
| `br-ml-runtime` | ML model runtime | MLRuntime |
| `br-ml-compiler-runtime` | ML compiler runtime | MLCompilerRuntime |
| `br-ml-compiler-services` | ML compilation services | MLCompilerServices |
| `br-ml-model-spec` | ML model specification | MLModelSpecification |
| `br-ml-asset-io` | ML asset I/O | MLAssetIO |
| `br-ml-remote` | Remote CoreML execution | RemoteCoreML |
| `br-cipher-ml` | Encrypted ML | CipherML |
| `br-proactive-ml` | Proactive ML predictions | ProactiveML |

### Knowledge Graph

| BlackRoad Name | Capability | Apple Original |
|---|---|---|
| `br-knowledge-graph` | Knowledge graph toolkit | KnowledgeGraphKit |
| `br-knowledge-core` | Core knowledge store | CoreKnowledge |
| `br-knowledge-monitor` | Knowledge monitoring | KnowledgeMonitor |
| `br-photos-knowledge` | Photo knowledge graph | PhotosKnowledgeGraph |
| `br-photos-intelligence` | Photo intelligence | PhotosIntelligence |

### Speech & Voice

| BlackRoad Name | Capability | Apple Original |
|---|---|---|
| `br-speech-core` | Core speech processing | CoreSpeech |
| `br-speech-foundation` | Speech foundation layer | CoreSpeechFoundation |
| `br-speech-embedded` | On-device speech recognition | CoreEmbeddedSpeechRecognition |
| `br-speech-recognition` | Speech recognition core | SpeechRecognitionCore |
| `br-speech-detector` | Speech detection | SpeechDetector |
| `br-speech-dictionary` | Speech dictionary | SpeechDictionary |
| `br-speech-local` | Local speech recognition bridge | LocalSpeechRecognitionBridge |
| `br-tts` | Text-to-speech | TextToSpeech |
| `br-tts-kona` | TTS Kona engine | TextToSpeechKonaSupport |
| `br-tts-maui` | TTS Maui engine | TextToSpeechMauiSupport |
| `br-tts-voicebank` | TTS voice banking | TextToSpeechVoiceBankingSupport |
| `br-live-speech` | Live speech services | LiveSpeechServices |

### NLP & Suggestions

| BlackRoad Name | Capability | Apple Original |
|---|---|---|
| `br-nlp-detect` | Natural language data detection | DataDetectorsNaturalLanguage |
| `br-parsec` | Parsec search model | CoreParsec / ParsecModel |
| `br-suggestions` | Core suggestions | CoreSuggestions |
| `br-suggestions-ml` | ML-powered suggestions | CoreSuggestionsML |
| `br-people-suggest` | People suggestions | PeopleSuggester |
| `br-account-suggest` | Account suggestions | AccountSuggestions |
| `br-proactive-suggest` | Proactive suggestion client | ProactiveSuggestionClientModel |

### Siri (Voice Assistant Stack)

| BlackRoad Name | Capability | Apple Original |
|---|---|---|
| `br-assistant-core` | Assistant core engine | SiriCore |
| `br-assistant-foundation` | Assistant foundation | SiriFoundation |
| `br-assistant-inference` | Assistant inference | SiriInference |
| `br-assistant-dialog` | Dialog engine | SiriDialogEngine |
| `br-assistant-nlu` | Natural language understanding | SiriNLUTypes |
| `br-assistant-nlg` | Natural language generation | SiriNaturalLanguageGeneration |
| `br-assistant-nlp` | Natural language parsing | SiriNaturalLanguageParsing |
| `br-assistant-tts` | Assistant text-to-speech | SiriTTS / SiriSpeechSynthesis |
| `br-assistant-entity` | Entity matching | SiriEntityMatcher |
| `br-assistant-ref-resolve` | Reference resolution | SiriReferenceResolution |
| `br-assistant-corrections` | Corrections engine | SiriCorrections |
| `br-assistant-remembers` | Memory/remembers system | SiriRemembers |
| `br-assistant-knowledge` | Knowledge engine | SiriKnowledge |
| `br-assistant-signals` | Signal processing | SiriSignals |
| `br-assistant-vox` | Voice experience | SiriVOX |
| `br-assistant-observation` | Observation engine | SiriObservation |
| `br-assistant-ontology` | Ontology system | SiriOntology |
| `br-assistant-analytics` | Analytics | SiriAnalytics |
| `br-assistant-private-learn` | On-device private learning | SiriPrivateLearningInference |
| `br-assistant-suggestions` | Assistant suggestions | SiriSuggestions / SiriSuggestionsIntelligence |

### Model Management

| BlackRoad Name | Capability | Apple Original |
|---|---|---|
| `br-model-store` | ML model storage | LighthouseCoreMLModelStore |
| `br-model-analysis` | ML model analysis | LighthouseCoreMLModelAnalysis |
| `br-feature-store` | ML feature storage | LighthouseCoreMLFeatureStore |

---

## Summary

| Category | Count |
|---|---|
| Vision (CoreML) | 18 models |
| Vision (Hailo-8) | 9 models |
| Audio & Speech | 19 models |
| NLP & Text | 15 models |
| Localized Contact Recognition | 13 models |
| People & Contact | 10 models |
| Prediction & Suggestion | 17 models |
| Location & Spatial | 6 models |
| Network & Hardware | 5 models |
| Encoder/Decoder & Core | 30 models |
| LLM (Ollama) | 14 models |
| **Total Models** | **156** |
| Frameworks mapped | 65+ |

## Ownership Reality

| Layer | Owner | BlackRoad Control |
|---|---|---|
| Hardware | Alexa (purchased) | Full |
| OS | Apple (licensed) | None — black box |
| 135 CoreML models | Apple (embedded) | Named and mapped, not modifiable |
| 20 Hailo HEF models | Ultralytics/open-source | Full — runs on our accelerator |
| 14 Ollama LLMs | Meta/Google/Alibaba/Microsoft | Full — runs on our fleet |
| System prompts | BlackRoad | Full |
| Routing/orchestration | BlackRoad | Full |
| Inference infrastructure | BlackRoad | Full |

**What we own:** The road, the routing, the naming, the fleet, the prompts, the Hailo models.
**What we don't own:** Apple's 135 CoreML weights, the LLM base weights.
**What we're building toward:** Training our own weights on our own hardware.

---

*BlackRoad OS, Inc. — Every model on our hardware gets a BlackRoad name.*
