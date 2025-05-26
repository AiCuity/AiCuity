
import SpeedCalibrationTool from '@/components/Calibration/SpeedCalibrationTool';

export default function CalibratePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Calibrate your reading speed</h1>
      <SpeedCalibrationTool />
    </main>
  );
}
