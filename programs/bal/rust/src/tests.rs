use super::*;

fn coefficients(input: &str) -> Vec<i64> {
    balance(input)
        .unwrap_or_else(|e| panic!("{input}: {e:?}"))
        .coefficients
}

#[test]
fn balances_the_emulator_reference_equations() {
    // Expected values match recovered v20 running in the TRS-80 emulator.
    let cases: [(&str, &[i64], &str); 9] = [
        ("H2+O2=H2.O", &[2, 1, 2], " 2( H2 )+( O2 )-^ 2( H2.O )"),
        (
            "C3.H8+O2=C.O2+H2.O",
            &[1, 5, 3, 4],
            "( C3.H8 )+ 5( O2 )-^ 3( C.O2 )+ 4( H2.O )",
        ),
        (
            "FE+O2=FE2.O3",
            &[4, 3, 2],
            " 4( FE )+ 3( O2 )-^ 2( FE2.O3 )",
        ),
        (
            "C12.H22.O11=C+H2.O",
            &[1, 12, 11],
            "( C12.H22.O11 )-^ 12( C )+ 11( H2.O )",
        ),
        (
            "CA(O.H)2+H3.P.O4=CA3(P.O4)2+H2.O",
            &[3, 2, 1, 6],
            " 3( CA<O.H>2 )+ 2( H3.P.O4 )-^( CA3<P.O4>2 )+ 6( H2.O )",
        ),
        (
            "K.MN.O4+H.CL=K.CL+MN.CL2+H2.O+CL2",
            &[2, 16, 2, 2, 8, 5],
            " 2( K.MN.O4 )+ 16( H.CL )-^ 2( K.CL )+ 2( MN.CL2 )+ 8( H2.O )+ 5( CL2 )",
        ),
        (
            "NA2.B4.O7+H2.O+H2.S.O4=NA2.S.O4+H3.B.O3",
            &[1, 5, 1, 1, 4],
            "( NA2.B4.O7 )+ 5( H2.O )+( H2.S.O4 )-^( NA2.S.O4 )+ 4( H3.B.O3 )",
        ),
        (
            "CU+H.N.O3=CU(N.O3)2+N.O+H2.O",
            &[3, 8, 3, 2, 4],
            " 3( CU )+ 8( H.N.O3 )-^ 3( CU<N.O3>2 )+ 2( N.O )+ 4( H2.O )",
        ),
        (
            "AL+O2=AL2.O3",
            &[4, 3, 2],
            " 4( AL )+ 3( O2 )-^ 2( AL2.O3 )",
        ),
    ];
    for (input, expected, trs80) in cases {
        let b = balance(input).unwrap();
        assert_eq!(b.coefficients, expected, "{input}");
        assert_eq!(b.trs80_text(), trs80, "{input}");
    }
}

#[test]
fn accepts_spaces_and_lower_case() {
    assert_eq!(coefficients("c3.h8 + o2 = c.o2 + h2.o"), [1, 5, 3, 4]);
}

#[test]
fn nested_groups_and_repeated_elements() {
    assert_eq!(
        coefficients("K4(FE(C.N)6)+K.MN.O4+H2.S.O4=K.H.S.O4+FE2(S.O4)3+MN.S.O4+H.N.O3+C.O2+H2.O"),
        [10, 122, 299, 162, 5, 122, 60, 60, 188]
    );
    assert_eq!(
        coefficients("C.H3.C.O.O.H + O2 = C.O2 + H2.O"),
        [1, 2, 2, 2]
    );
}

#[test]
fn balances_charge_with_the_at_sign() {
    // MnO4⁻ + Fe²⁺ + H⁺ → Mn²⁺ + Fe³⁺ + H2O
    assert_eq!(
        coefficients("MN.O4@-1 + FE@2 + H@ = MN@2 + FE@3 + H2.O"),
        [1, 5, 8, 1, 5, 4]
    );
}

#[test]
fn reports_original_errors() {
    let cases = [
        ("H2=O2", BalanceError::Alchemy("H".into())),
        ("H2+O2=H2.O=H2", BalanceError::TooManyEquals),
        ("H2#=H", BalanceError::IllegalCharacter),
        ("CA(O.H2=CA+O+H", BalanceError::MismatchedParens),
        ("2H2+O2=H2.O", BalanceError::SubscriptPosition),
        ("H2+O2+H2.O2=H2.O", BalanceError::Ambiguous),
        ("H2.O=H2+O2+H2.O2", BalanceError::Ambiguous),
        ("H2.O+H2=H2.O2", BalanceError::NegativeSolution),
        ("=", BalanceError::NoElements),
    ];
    for (input, expected) in cases {
        assert_eq!(balance(input).unwrap_err(), expected, "{input}");
    }
}

#[test]
fn independent_sub_equations_are_mixed() {
    let b = balance("H2 + C.L2 + NA + O2 = H.CL + NA2.O").unwrap_err();
    assert_eq!(b, BalanceError::Alchemy("C".into()));
    let b = balance("H2 + CL2 + NA + O2 = H.CL + NA2.O").unwrap();
    assert!(b.mixed);
    assert_eq!(b.coefficients, [1, 1, 4, 1, 2, 2]);
}

#[test]
fn pretty_formulas() {
    let b = balance("C3.H8+O2=C.O2+H2.O").unwrap();
    assert_eq!(b.pretty_text(), "C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O");
    assert_eq!(pretty_formula("CA(O.H)2"), "Ca(OH)₂");
    assert_eq!(pretty_formula("S.O4@-2"), "SO₄²⁻");
    assert_eq!(pretty_formula("FE@3"), "Fe³⁺");
    assert_eq!(pretty_formula("H@"), "H⁺");
}

#[test]
fn overflow_is_reported() {
    // Large subscripts push the coefficients past the original's 1E16 limit.
    let r = balance("A999999937.B2 + B999999929 = A2.B999999893");
    assert!(matches!(r, Err(BalanceError::Overflow)), "{r:?}");
}

#[test]
fn json_output() {
    assert!(balance_json("H2+O2=H2.O").starts_with("{\"ok\":true,\"compounds\":[\"H2\",\"O2\",\"H2.O\"],\"reactants\":2,\"coefficients\":[2,1,2]"));
    assert!(balance_json("H2=O2").contains("\"error\":\"ALCHEMY !!!!!\""));
}
