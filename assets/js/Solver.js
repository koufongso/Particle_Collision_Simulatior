/**
 * All the following solver ONLY return real roots
 */


/**
 * solve the quartic equation
 * https://mathworld.wolfram.com/QuarticEquation.html
 * @param {*} a4 
 * @param {*} a3 
 * @param {*} a2 
 * @param {*} a1 
 * @param {*} a0 
 */
function solve_p4(a4, a3, a2, a1, a0) {
    if (a4 == 0) return solve_p3(a3, a2, a1, a0);

    if (a4 != 1) {
        a3 /= a4;
        a2 /= a4;
        a1 /= a4;
        a0 /= a4;
    }

    const y = solve_p3(1, -a2, a1*a3-4*a0, 4*a2*a0-a1*a1-a3*a3*a0);
    const R = Math.sqrt(0.25 * a3 * a3 - a2 + y);
    const D = (R == 0 ? Math.sqrt(0.75 * a3 * a3 - 2 * a2 + 2 * Math.sqrt(y * y - 4 * a0))
        : Math.sqrt(0.75 * a3 * a3 - R * R - 2 * a2 + 0.25 * (4 * a3 * a2 - 8 * a1 - a3 * a3 * a3) / R));
    const E = (R == 0 ? Math.sqrt(0.75 * a3 * a3 - 2 * a2 - 2 * Math.sqrt(y * y - 4 * a0))
        : Math.sqrt(0.75 * a3 * a3 - R * R - 2 * a2 - 0.25 * (4 * a3 * a2 - 8 * a1 - a3 * a3 * a3) / R));

    return [-0.25*a3+0.5*R+0.5*D,-0.25*a3+0.5*R-0.5*D,-0.25*a3-0.5*R+0.5*E,-0.25*a3-0.5*R-0.5*E];
}

/**
 * slove the cubic equation
 * Reference: https://mathworld.wolfram.com/CubicFormula.html
 * @param {*} a3 
 * @param {*} a2 
 * @param {*} a1 
 * @param {*} a0 
 */
function solve_p3(a3, a2, a1, a0) {
    if (a3 == 0) return solve_p2(a2, a1, a0);
    if (a3 != 1) {
        a2 /= a3;
        a1 /= a3;
        a0 /= a3;
    }

    const Q = (3 * a1 - a2 * a2) / 9;
    const R = (9 * a2 * a1 - 27 * a0 - 2 * a2 * a2 * a2) / 54;
    const D = Q * Q * Q + R * R;
    const S = Math.cbrt(R + Math.sqrt(D));
    const T = Math.cbrt(R - Math.sqrt(D));

    return -a2 / 3 + S + T;
}



function solve_p2(a2, a1, a0) {
    if (a2 == 0) return solve_p1(a1, a0);
    const delta = a1*a1 - 4*a2*a0;
    return [(-a1 - Math.sqrt(delta)) / (2 * a2), (-a1 + Math.sqrt(delta)) / (2 * a2)];
}

function solve_p1(a1, a0) {
    return [-a0 / a1];
}