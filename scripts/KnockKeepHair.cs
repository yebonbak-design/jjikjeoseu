using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class KnockKeepHair {
  public static string Run(string input, string output) {
    using (var src = Image.FromFile(input))
    using (var bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(bmp)) g.DrawImage(src, 0, 0, src.Width, src.Height);
      int w = bmp.Width, h = bmp.Height;
      var data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = data.Stride;
      byte[] px = new byte[Math.Abs(stride) * h];
      Marshal.Copy(data.Scan0, px, 0, px.Length);

      bool[] isChar = new bool[w * h];
      int minX = w, minY = h, maxX = 0, maxY = 0;
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          int o = y * stride + x * 4;
          int r = px[o + 2], gc = px[o + 1], b = px[o];
          if (r + gc + b > 90) {
            isChar[y * w + x] = true;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      int boxH = Math.Max(1, maxY - minY);
      int headBot = minY + (int)(boxH * 0.42);

      int[] dist = new int[w * h];
      for (int i = 0; i < dist.Length; i++) dist[i] = 9999;
      var q = new Queue<int>();
      for (int i = 0; i < isChar.Length; i++) {
        if (!isChar[i]) continue;
        dist[i] = 0;
        q.Enqueue(i);
      }
      int[] dx = { 1, -1, 0, 0 };
      int[] dy = { 0, 0, 1, -1 };
      while (q.Count > 0) {
        int idx = q.Dequeue();
        int x = idx % w, y = idx / w, d = dist[idx];
        for (int k = 0; k < 4; k++) {
          int nx = x + dx[k], ny = y + dy[k];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          int nidx = ny * w + nx;
          if (dist[nidx] <= d + 1) continue;
          dist[nidx] = d + 1;
          q.Enqueue(nidx);
        }
      }

      int kept = 0, cleared = 0;
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          int idx = y * w + x;
          int o = y * stride + x * 4;
          int d = dist[idx];
          bool keep = isChar[idx] || d <= 2 || (y <= headBot && d <= 38);
          if (keep) {
            kept++;
            continue;
          }
          px[o + 3] = 0;
          cleared++;
        }
      }

      Marshal.Copy(px, 0, data.Scan0, px.Length);
      bmp.UnlockBits(data);
      bmp.Save(output, ImageFormat.Png);
      return w + "x" + h + " kept=" + kept + " cleared=" + cleared;
    }
  }
}
