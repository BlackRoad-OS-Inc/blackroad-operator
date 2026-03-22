from prism_math_spiral import analyze_harmonics, HarmonicInfo


def test_analyze_harmonics_basic(capsys):
    results, fig = analyze_harmonics(110.0, harmonics=[1, 2, 3, 4], plot=False)
    captured = capsys.readouterr().out

    assert isinstance(results, list)
    assert all(isinstance(entry, HarmonicInfo) for entry in results)
    assert fig is None

    # Fundamental should map close to A2 (MIDI 45)
    assert results[0].midi == 45
    assert results[0].note == "A2"

    # Third harmonic of A2 is close to E4 (MIDI 64)
    third = results[2]
    assert third.midi == 64
    assert third.note == "E4"
    assert abs(third.cents_error) < 20

    # Ensure table output contains headers and note names
    assert "n" in captured.splitlines()[0]
    assert "A2" in captured
    assert "E4" in captured


def test_analyze_harmonics_validates_input():
    try:
        analyze_harmonics(-1.0)
    except ValueError:
        pass
    else:
        raise AssertionError("Negative base frequency should raise ValueError")

    try:
        analyze_harmonics(440.0, harmonics=[0])
    except ValueError:
        pass
    else:
        raise AssertionError("Zero harmonic should raise ValueError")
