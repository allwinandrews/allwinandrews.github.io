"""Run MediaPipe Pose over the fitness-ai squat demo and export world landmarks.
Usage: python export_pose.py <video.mp4> <out.json>"""
import json, sys
import cv2, mediapipe as mp

src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
step = 2
frames, i = [], 0
with mp.solutions.pose.Pose(model_complexity=1, smooth_landmarks=True) as pose:
    while True:
        ok, img = cap.read()
        if not ok: break
        if i % step == 0:
            r = pose.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            if r.pose_world_landmarks:
                f = []
                for l in r.pose_world_landmarks.landmark:
                    f += [round(l.x, 3), round(-l.y, 3), round(-l.z, 3)]
                frames.append(f)
            else:
                frames.append(None)
        i += 1
found = sum(1 for f in frames if f)
conn = sorted([list(c) for c in mp.solutions.pose.POSE_CONNECTIONS])
json.dump({"fps": fps / step, "connections": conn, "frames": frames}, open(out, "w"), separators=(",", ":"))
print(len(frames), "frames", found, "with pose")
