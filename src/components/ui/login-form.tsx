"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Lock, User } from "lucide-react";
import { BrandLogo } from "@/components/branding/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const vertexSmokeySource = `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`;

const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = fragCoord / iResolution;
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.5;
    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    fragColor = vec4(u_color * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

type BlurSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

type SmokeyBackgroundProps = {
  backdropBlurAmount?: string;
  color?: string;
  className?: string;
};

const blurClassMap: Record<BlurSize, string> = {
  none: "backdrop-blur-none",
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
  "3xl": "backdrop-blur-3xl"
};

export function SmokeyBackground({
  backdropBlurAmount = "sm",
  color = "#1E40AF",
  className = ""
}: SmokeyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl");

    if (!gl) {
      return;
    }

    const hexToRgb = (hex: string): [number, number, number] => {
      const r = parseInt(hex.substring(1, 3), 16) / 255;
      const g = parseInt(hex.substring(3, 5), 16) / 255;
      const b = parseInt(hex.substring(5, 7), 16) / 255;
      return [r, g, b];
    };

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);

      if (!shader) {
        return null;
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSmokeySource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSmokeySource);

    if (!vertexShader || !fragmentShader) {
      return;
    }

    const program = gl.createProgram();

    if (!program) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const iMouseLocation = gl.getUniformLocation(program, "iMouse");
    const uColorLocation = gl.getUniformLocation(program, "u_color");
    const [r, g, b] = hexToRgb(color);
    const startTime = Date.now();

    gl.uniform3f(uColorLocation, r, g, b);

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(iResolutionLocation, width, height);
      gl.uniform1f(iTimeLocation, (Date.now() - startTime) / 1000);
      gl.uniform2f(iMouseLocation, isHovering ? mousePosition.x : width / 2, isHovering ? height - mousePosition.y : height / 2);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frameRef.current = requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    render();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [color, isHovering, mousePosition]);

  const finalBlurClass = blurClassMap[backdropBlurAmount as BlurSize] || blurClassMap.sm;

  return (
    <div className={cn("absolute inset-0 h-full w-full overflow-hidden", className)}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className={cn("absolute inset-0", finalBlurClass)} />
    </div>
  );
}

type AdminLoginFormProps = {
  callbackPath: string;
  action: (formData: FormData) => void;
  submitLabel: string;
  title: string;
  subtitle: string;
  emailLabel: string;
  passwordLabel: string;
  errorMessage?: string | null;
  accessDeniedMessage?: string | null;
};

export function AdminLoginForm({
  callbackPath,
  action,
  submitLabel,
  title,
  subtitle,
  emailLabel,
  passwordLabel,
  errorMessage,
  accessDeniedMessage
}: AdminLoginFormProps) {
  return (
    <section className="relative isolate h-screen w-full overflow-hidden rounded-none border-0 bg-[linear-gradient(135deg,#f8fbff_0%,#eef7ff_38%,#fdfcff_68%,#f7f3ff_100%)] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute inset-0 dark:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.22),transparent_36%),radial-gradient(circle_at_82%_18%,rgba(167,139,250,0.22),transparent_34%),radial-gradient(circle_at_50%_78%,rgba(59,130,246,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,250,252,0.92))]" />
        <div className="absolute left-[-8rem] top-[14%] h-[24rem] w-[24rem] rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="absolute right-[-6rem] top-[8%] h-[20rem] w-[20rem] rounded-full bg-violet-200/45 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[26%] h-[22rem] w-[22rem] rounded-full bg-sky-100/80 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.35),rgba(255,255,255,0.35)),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[length:100%_100%,72px_72px,72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_86%)]" />
      </div>
      <div className="absolute inset-0 hidden dark:block">
        <SmokeyBackground color="#1D4ED8" backdropBlurAmount="md" className="opacity-80" />
      </div>
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo className="w-[150px] sm:w-[170px]" framed priority />
            <ThemeToggle className="rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm dark:border-white/10 dark:bg-white/[0.06]" />
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <div className="max-w-xl space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-[3.4rem]">
                  {title}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-700 dark:text-slate-300 sm:text-lg">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center border-t border-slate-200 bg-white/50 p-6 dark:border-white/10 dark:bg-slate-950/45 lg:border-l lg:border-t-0 sm:p-8 lg:p-10">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/60">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Welcome Back</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to continue to the admin panel</p>
            </div>
            <form action={action} className="mt-8 space-y-8">
              <input type="hidden" name="callback" value={callbackPath} />
              <div className="relative z-0">
                <input
                  type="email"
                  id="admin-email"
                  name="email"
                  className="peer block w-full appearance-none border-0 border-b-2 border-slate-400/60 bg-transparent py-2.5 px-0 text-sm text-slate-950 focus:border-cyan-500 focus:outline-none focus:ring-0 dark:border-slate-500 dark:text-white"
                  placeholder=" "
                  autoComplete="username"
                  required
                />
                <label
                  htmlFor="admin-email"
                  className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-slate-600 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-cyan-600 dark:text-slate-300 dark:peer-focus:text-cyan-300"
                >
                  <User className="-mt-1 mr-2 inline-block" size={16} />
                  {emailLabel}
                </label>
              </div>
              <div className="relative z-0">
                <input
                  type="password"
                  id="admin-password"
                  name="password"
                  className="peer block w-full appearance-none border-0 border-b-2 border-slate-400/60 bg-transparent py-2.5 px-0 text-sm text-slate-950 focus:border-cyan-500 focus:outline-none focus:ring-0 dark:border-slate-500 dark:text-white"
                  placeholder=" "
                  autoComplete="current-password"
                  required
                />
                <label
                  htmlFor="admin-password"
                  className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-slate-600 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-cyan-600 dark:text-slate-300 dark:peer-focus:text-cyan-300"
                >
                  <Lock className="-mt-1 mr-2 inline-block" size={16} />
                  {passwordLabel}
                </label>
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 dark:focus:ring-cyan-300 dark:focus:ring-offset-slate-950"
              >
                {submitLabel}
                <ArrowRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            {accessDeniedMessage ? <p className="mt-4 text-sm leading-6 text-amber-700 dark:text-amber-300">{accessDeniedMessage}</p> : null}
            {errorMessage ? <p className="mt-4 text-sm leading-6 text-rose-600 dark:text-rose-300">{errorMessage}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminLoginForm;
