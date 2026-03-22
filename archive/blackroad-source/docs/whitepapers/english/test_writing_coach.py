"""Tests for EmojiWritingCoach from emoji_writing_practice.py"""

from emoji_writing_practice import EmojiWritingCoach


class TestInit:
    def test_initial_score_is_zero(self):
        coach = EmojiWritingCoach()
        assert coach.score == 0

    def test_initial_feedback_is_empty(self):
        coach = EmojiWritingCoach()
        assert coach.feedback == []


class TestAnalyzeSentenceStructure:
    def test_valid_sentence_returns_true(self):
        coach = EmojiWritingCoach()
        result = coach.analyze_sentence_structure("I eat pizza")
        assert result is True

    def test_missing_subject_no_subject_words(self):
        """Sentence with no subject word substring at all."""
        coach = EmojiWritingCoach()
        # No substring of any subject word (i, you, he, she, it, we, they, the, a, an)
        # "run" contains no subject substrings except... careful.
        # Actually 'run' doesn't contain 'i','you','he','she','it','we','they','the','a','an'
        # Wait: 'a' in 'run' -> False. Good. But 'run' contains no verb either?
        # Verbs: is,are,was,were,go,went,eat,ate,run,ran,make,made,do,did,have,has,had
        # 'run' in 'run' -> True (verb found)
        result = coach.analyze_sentence_structure("run")
        assert result is False  # no subject found, verb found via 'run'

    def test_missing_verb_no_verb_substrings(self):
        """Sentence where no verb substring is present."""
        coach = EmojiWritingCoach()
        # 'the' is a subject. Need no verb substrings.
        # "the sky" - check: is,are,was,were,go,went,eat,ate,run,ran,make,made,do,did,have,has,had
        # None of those are substrings of "the sky"
        result = coach.analyze_sentence_structure("the sky")
        assert result is False

    def test_short_sentence_no_length_bonus(self):
        coach = EmojiWritingCoach()
        coach.analyze_sentence_structure("I go")
        # subject +10, verb +10, but only 2 words so no length bonus
        assert coach.score == 20

    def test_long_sentence_gets_length_bonus(self):
        coach = EmojiWritingCoach()
        coach.analyze_sentence_structure("I go home")
        # subject +10, verb +10, 3 words +10
        assert coach.score == 30

    def test_score_accumulates_across_calls(self):
        coach = EmojiWritingCoach()
        coach.analyze_sentence_structure("I go home")
        coach.analyze_sentence_structure("She is happy")
        # First: 30, Second: 30
        assert coach.score == 60

    def test_subject_detected_via_substring(self):
        """The implementation uses substring matching: 'a' in sentence.lower()."""
        coach = EmojiWritingCoach()
        # "eat pizza" contains 'a' (substring of 'pizza'), so subject is detected
        result = coach.analyze_sentence_structure("eat pizza")
        assert result is True  # both subject ('a' in 'pizza') and verb ('eat') found

    def test_verb_detected_via_substring(self):
        """The implementation uses substring matching for verbs too."""
        coach = EmojiWritingCoach()
        # "the big dog" contains 'do' (substring of 'dog'), so verb is detected
        result = coach.analyze_sentence_structure("the big dog")
        assert result is True

    def test_no_subject_no_verb_possible(self):
        """Find a string with truly no subject or verb substrings."""
        coach = EmojiWritingCoach()
        # "hmm" - no subject substrings, no verb substrings
        result = coach.analyze_sentence_structure("hmm")
        assert result is False
        assert coach.score == 0


class TestCheckCommonMistakes:
    def test_clean_sentence_returns_true(self):
        coach = EmojiWritingCoach()
        # "She goes to school" contains "he go" as substring of "she goes"
        # so use a sentence that avoids all patterns
        result = coach.check_common_mistakes("The cat sleeps on the bed")
        assert result is True
        assert coach.score == 20

    def test_he_go_pattern_detected(self):
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("he go to school")
        assert result is False

    def test_she_go_triggers_both_he_go_and_she_go(self):
        """'she go' contains both 'he go' and 'she go' substrings."""
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("she go to school")
        assert result is False

    def test_she_eat_pattern_detected(self):
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("she eat lunch")
        assert result is False

    def test_you_am_detected(self):
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("you am happy")
        assert result is False

    def test_they_am_detected(self):
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("they am going")
        assert result is False

    def test_he_am_detected(self):
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("he am tired")
        assert result is False

    def test_did_went_detected(self):
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("I did went to the store")
        assert result is False

    def test_did_ate_detected(self):
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("She did ate dinner")
        assert result is False

    def test_i_am_i_prefix_detected(self):
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("I am I going to school")
        assert result is False

    def test_no_score_on_mistakes(self):
        coach = EmojiWritingCoach()
        coach.check_common_mistakes("he go fast")
        assert coach.score == 0

    def test_she_goes_triggers_substring_match(self):
        """'she goes' contains 'he go' as a substring, triggering false positive."""
        coach = EmojiWritingCoach()
        result = coach.check_common_mistakes("She goes to school")
        # This is a known quirk: "she goes" contains "he go" substring
        assert result is False


class TestSuggestImprovements:
    def test_with_adjective_gets_bonus(self):
        coach = EmojiWritingCoach()
        coach.suggest_improvements("The beautiful sunset was amazing")
        assert coach.score >= 10

    def test_without_adjective_no_bonus(self):
        coach = EmojiWritingCoach()
        coach.suggest_improvements("I went there")
        # No adjective, short, no emotion
        assert coach.score == 0

    def test_long_sentence_gets_detail_bonus(self):
        coach = EmojiWritingCoach()
        coach.suggest_improvements("I walked to the store and bought some milk yesterday")
        # >7 words = +10
        assert coach.score >= 10

    def test_emotion_words_get_bonus(self):
        coach = EmojiWritingCoach()
        coach.suggest_improvements("I love this place")
        assert coach.score >= 10

    def test_all_bonuses_combined(self):
        coach = EmojiWritingCoach()
        coach.suggest_improvements("I love the beautiful big garden where amazing flowers grow every day")
        # adjective +10, >7 words +10, emotion (love+amazing) +10
        assert coach.score == 30

    def test_short_no_adjective_no_emotion(self):
        coach = EmojiWritingCoach()
        coach.suggest_improvements("ok then")
        assert coach.score == 0


class TestAnalyzeParagraph:
    def test_three_plus_sentences(self):
        coach = EmojiWritingCoach()
        count = coach.analyze_paragraph("I am happy. You are nice. We are friends.")
        assert count == 3
        assert coach.score >= 10

    def test_short_paragraph_one_sentence(self):
        coach = EmojiWritingCoach()
        coach.analyze_paragraph("Short.")
        # 1 sentence, no variety possible
        assert coach.score == 0

    def test_varied_lengths_get_bonus(self):
        coach = EmojiWritingCoach()
        coach.analyze_paragraph("Hi. I am very happy today. Ok.")
        # 3 sentences with different lengths -> both bonuses
        assert coach.score == 20

    def test_returns_sentence_count(self):
        coach = EmojiWritingCoach()
        count = coach.analyze_paragraph("One. Two. Three. Four.")
        assert count == 4

    def test_same_length_no_variety_bonus(self):
        coach = EmojiWritingCoach()
        coach.analyze_paragraph("I go. I go. I go.")
        # 3 sentences (+10) but all same length (no variety bonus)
        assert coach.score == 10

    def test_two_sentences_no_length_bonus(self):
        coach = EmojiWritingCoach()
        count = coach.analyze_paragraph("Hello there. Goodbye now.")
        assert count == 2
        # <3 sentences so no length bonus, but variety may apply
        # "Hello there" = 2 words, "Goodbye now" = 2 words -> same length, no variety
        assert coach.score == 0

    def test_paragraph_with_varied_two_sentences(self):
        coach = EmojiWritingCoach()
        count = coach.analyze_paragraph("Hi. I am very happy.")
        assert count == 2
        # <3 sentences, no length bonus; different lengths -> variety +10
        assert coach.score == 10
